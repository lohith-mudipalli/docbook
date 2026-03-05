package com.docbook.backend.service;

import com.docbook.backend.model.*;
import com.docbook.backend.repository.DoctorAvailabilityRepository;
import com.docbook.backend.repository.DoctorRepository;
import com.docbook.backend.repository.TimeslotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;

@Service
public class TimeslotService {

    private final DoctorRepository doctorRepo;
    private final DoctorAvailabilityRepository availabilityRepo;
    private final TimeslotRepository timeslotRepo;

    // For now we assume doctors operate in America/New_York
    private static final ZoneId DOCTOR_ZONE = ZoneId.of("America/New_York");

    public TimeslotService(DoctorRepository doctorRepo, DoctorAvailabilityRepository availabilityRepo, TimeslotRepository timeslotRepo) {
        this.doctorRepo = doctorRepo;
        this.availabilityRepo = availabilityRepo;
        this.timeslotRepo = timeslotRepo;
    }

    @Transactional
    public int generateTimeslots(Long doctorId, LocalDate from, LocalDate to) {
        Doctor doctor = doctorRepo.findById(doctorId).orElseThrow(() -> new RuntimeException("Doctor not found"));
        List<DoctorAvailability> rules = availabilityRepo.findAllByDoctor(doctor);

        int created = 0;

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            int isoDow = date.getDayOfWeek().getValue(); // 1..7

            for (DoctorAvailability rule : rules) {
                if (rule.getDayOfWeek() != isoDow) continue;

                LocalTime start = rule.getStartLocal();
                LocalTime end = rule.getEndLocal();
                int slot = rule.getSlotMinutes();

                for (LocalTime t = start; t.plusMinutes(slot).compareTo(end) <= 0; t = t.plusMinutes(slot)) {
                    ZonedDateTime startZdt = ZonedDateTime.of(date, t, DOCTOR_ZONE);
                    ZonedDateTime endZdt = startZdt.plusMinutes(slot);

                    Instant startUtc = startZdt.toInstant();
                    Instant endUtc = endZdt.toInstant();

                    if (!timeslotRepo.existsByDoctorAndStartTimeUtcAndEndTimeUtc(doctor, startUtc, endUtc)) {
                        timeslotRepo.save(new Timeslot(doctor, startUtc, endUtc, TimeslotStatus.AVAILABLE));
                        created++;
                    }
                }
            }
        }

        return created;
    }
}