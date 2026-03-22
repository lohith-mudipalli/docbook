package com.docbook.backend;

import com.docbook.backend.model.*;
import com.docbook.backend.repository.*;
import com.docbook.backend.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class BookingServiceTest {

    private final UserRepository userRepo;
    private final DoctorRepository doctorRepo;
    private final TimeslotRepository timeslotRepo;
    private final AppointmentRepository appointmentRepo;
    private final BookingService bookingService;

    @Autowired
    public BookingServiceTest(UserRepository userRepo,
                              DoctorRepository doctorRepo,
                              TimeslotRepository timeslotRepo,
                              AppointmentRepository appointmentRepo,
                              BookingService bookingService) {
        this.userRepo = userRepo;
        this.doctorRepo = doctorRepo;
        this.timeslotRepo = timeslotRepo;
        this.appointmentRepo = appointmentRepo;
        this.bookingService = bookingService;
    }

    @Test
    @Transactional
    void overlapQueryWorks() {
        User doctorUser = userRepo.save(new User("doc@test.com", "x", Role.DOCTOR));
        Doctor doctor = doctorRepo.save(new Doctor(doctorUser, "Dr Test", "Cardiology"));

        User patient = userRepo.save(new User("pat@test.com", "x", Role.PATIENT));

        Instant start = Instant.parse("2026-03-01T10:00:00Z");
        Instant end = Instant.parse("2026-03-01T10:30:00Z");

        appointmentRepo.save(new Appointment(doctor, patient, start, end, AppointmentStatus.CONFIRMED));

        boolean overlap = appointmentRepo.existsByDoctorAndStatusAndStartTimeUtcLessThanAndEndTimeUtcGreaterThan(
                doctor,
                AppointmentStatus.CONFIRMED,
                Instant.parse("2026-03-01T10:15:00Z"),
                Instant.parse("2026-03-01T09:50:00Z")
        );

        assertTrue(overlap);
    }
}