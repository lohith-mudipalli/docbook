package com.docbook.backend.controller;

import com.docbook.backend.model.Doctor;
import com.docbook.backend.model.Timeslot;
import com.docbook.backend.model.TimeslotStatus;
import com.docbook.backend.repository.DoctorRepository;
import com.docbook.backend.repository.TimeslotRepository;
import com.docbook.backend.service.TimeslotService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/timeslots")
public class TimeslotController {

    private final TimeslotService timeslotService;
    private final DoctorRepository doctorRepo;
    private final TimeslotRepository timeslotRepo;

    public TimeslotController(TimeslotService timeslotService, DoctorRepository doctorRepo, TimeslotRepository timeslotRepo) {
        this.timeslotService = timeslotService;
        this.doctorRepo = doctorRepo;
        this.timeslotRepo = timeslotRepo;
    }

    // Generate timeslots for a doctor in a date range (Doctor/Admin)
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    @PostMapping("/generate")
    public Map<String, Object> generate(
            @RequestParam Long doctorId,
            @RequestParam String from,   // YYYY-MM-DD
            @RequestParam String to      // YYYY-MM-DD
    ) {
        int created = timeslotService.generateTimeslots(
                doctorId,
                LocalDate.parse(from),
                LocalDate.parse(to)
        );
        return Map.of("created", created);
    }

    // Patient views AVAILABLE timeslots for doctor between utc instants
    @GetMapping
    public List<Timeslot> available(
            @RequestParam Long doctorId,
            @RequestParam String fromUtc,
            @RequestParam String toUtc
    ) {
        Doctor doctor = doctorRepo.findById(doctorId).orElseThrow(() -> new RuntimeException("Doctor not found"));

        Instant from = Instant.parse(fromUtc);
        Instant to = Instant.parse(toUtc);

        return timeslotRepo.findAllByDoctorAndStatusAndStartTimeUtcBetween(doctor, TimeslotStatus.AVAILABLE, from, to);
    }
}