package com.docbook.backend.repository;

import com.docbook.backend.model.Appointment;
import com.docbook.backend.model.Doctor;
import com.docbook.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.Instant;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findAllByPatient(User patient);

    List<Appointment> findAllByDoctor(Doctor doctor);

    //overlap check - called as load-bearing
    boolean existsByDoctorAndStatusAndStartTimeUtcLessThanAndEndTimeUtcGreaterThan(
        Doctor doctor,
        com.docbook.backend.model.AppointmentStatus status,
        Instant newEnd,
        Instant newStart
    );
    
} 
