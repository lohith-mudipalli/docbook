package com.docbook.backend.service;

import com.docbook.backend.model.*;
import com.docbook.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.Instant;

@Service
public class BookingService {
  
    private final TimeslotRepository timeslotRepo;
    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;
    private final AuditLogRepository auditRepo;
    private final CurrentUserService currentUser;
    private final NotificationService notificationService;

    public BookingService(TimeslotRepository timeslotRepo, AppointmentRepository appointmentRepo, DoctorRepository doctorRepo, AuditLogRepository auditRepo, CurrentUserService currentUser, NotificationService notificationService) {
        this.timeslotRepo = timeslotRepo;
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
        this.auditRepo = auditRepo;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
    }

    //Patient Book AVAILABLE timeslot
    @Transactional
    public Appointment book(Long timeslotId) {
        User patient = currentUser.get();

        if(patient.getRole() != Role.PATIENT) {
            throw new RuntimeException("Only PATIENT can book");
        }

        //Lock row to prevent double booking
        Timeslot slot = timeslotRepo.findByIdForUpdate(timeslotId). orElseThrow(() -> new RuntimeException("Timeslot not found"));

        if(slot.getStatus() != TimeslotStatus.AVAILABLE) {
            throw new RuntimeException("Timeslot not available");
        }

        Doctor doctor = slot.getDoctor();
        Instant start = slot.getStartTimeUtc();
        Instant end = slot.getEndTimeUtc();

        //Extra Safety: overlap check( if you ever allow custom times)
        boolean overlap = appointmentRepo.existsByDoctorAndStatusAndStartTimeUtcLessThanAndEndTimeUtcGreaterThan(doctor, AppointmentStatus.CONFIRMED, end, start);
        if(overlap) {
            throw new RuntimeException("Slot overlaps with existing appointment");
        }

        //Mark slot as BOOKED
        slot.setStatus(TimeslotStatus.BOOKED);

        //Create Appointment
        Appointment appt = appointmentRepo.save(
                new Appointment(doctor, patient, start, end, AppointmentStatus.CONFIRMED)
        );

        //AuditLog
        auditRepo.save(new AuditLog(
            patient.getId(), 
            "APPOINTMENT_BOOKED",
            "APPOINTMENT",
            appt.getId(),
            Instant.now(),
            "{\"timeslotId\":" + timeslotId + "}"
        ));

        //Notification Service for enqueue email job
        notificationService.enqueueAppointmentBookedEmail(
            patient.getEmail(),
            appt.getId(),
            start.toString(),
             end.toString()
            );
        return appt;

    }

    //List appointment for Current Users
    public List<Appointment> myAppointments() {
        User u = currentUser.get();

        if(u.getRole() == Role.PATIENT) {
            return appointmentRepo.findAllByPatient(u);
        }
        if(u.getRole() == Role.DOCTOR) {
            Doctor d = doctorRepo.findByUser(u).orElseThrow(() -> new RuntimeException("Doctor profile is missing"));
            return appointmentRepo.findAllByDoctor(d);
        }
        return appointmentRepo.findAll(); // For Admin
    }

    //Cancel Appointment with Ownership rules
    @Transactional
    public void cancel(Long appointmentId) {
        User actor = currentUser.get();
        Appointment appt = appointmentRepo.findById(appointmentId)
                    .orElseThrow(() -> new RuntimeException("Appointment not found"));
        boolean allowed = false;

        if(actor.getRole() == Role.ADMIN) {
            allowed = true;
        } else if(actor.getRole() == Role.PATIENT) {
            allowed = appt.getPatient().getId().equals(actor.getId());
        } else if(actor.getRole() == Role.DOCTOR) {
            Doctor d = doctorRepo.findByUser(actor). orElseThrow(() -> new RuntimeException("Doctor Profile Missing"));
            allowed = appt.getDoctor().getId().equals(d.getId());
        }

        if(!allowed) throw new RuntimeException("Forbidden");

        appt.setStatus(AppointmentStatus.CANCELLED);

        auditRepo.save(new AuditLog(
                actor.getId(),
                "APPOINTMENT_CANCELLED",
                "APPOINTMENT",
                appt.getId(),
                Instant.now(),
                "{}"
        ));


    }
}
