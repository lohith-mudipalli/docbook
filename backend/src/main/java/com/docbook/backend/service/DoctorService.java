package com.docbook.backend.service;

import com.docbook.backend.dto.AvailabilityRequest;
import com.docbook.backend.dto.CreateDoctorRequest;
import com.docbook.backend.repository.DoctorAvailabilityRepository;
import com.docbook.backend.repository.DoctorRepository;
import com.docbook.backend.repository.UserRepository;
import com.docbook.backend.model.Doctor;
import com.docbook.backend.model.DoctorAvailability;
import com.docbook.backend.model.Role;
import com.docbook.backend.model.User;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepo;
    private final UserRepository userRepo;
    private final DoctorAvailabilityRepository availabilityRepo;

    public DoctorService(DoctorRepository doctorRepo, UserRepository userRepo, DoctorAvailabilityRepository availabilityRepo) {
        this.doctorRepo = doctorRepo;
        this.userRepo = userRepo;
        this.availabilityRepo = availabilityRepo;
    }
    
    @Transactional
    public Doctor createDoctor(CreateDoctorRequest req) {
        User user = userRepo.findByEmail(req.userEmail.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(Role.DOCTOR);
        Doctor doctor = new Doctor(user, req.displayName, req.specialization);
        return doctorRepo.save(doctor);
    }

    @Transactional
    public void setAvailability(long doctorId, List<AvailabilityRequest> slots) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        availabilityRepo.deleteAllByDoctor(doctor); 

        for (AvailabilityRequest s: slots) {
            LocalTime start = LocalTime.parse(s.startLocal);
            LocalTime end = LocalTime.parse(s.endLocal);

            if(!start.isBefore(end)) throw new RuntimeException("startLocal must be before endLocal");
            if(s.slotMinutes == null || s.slotMinutes <= 0) throw new RuntimeException("slotMinutes invalid");

            availabilityRepo.save(new DoctorAvailability(doctor, s.dayOfWeek, start, end, s.slotMinutes));
        }
    }


}
