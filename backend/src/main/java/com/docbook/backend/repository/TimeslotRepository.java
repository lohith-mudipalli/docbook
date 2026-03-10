package com.docbook.backend.repository;

import com.docbook.backend.model.Doctor;
import com.docbook.backend.model.Timeslot;
import com.docbook.backend.model.TimeslotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;
import java.time.Instant;

public interface TimeslotRepository extends JpaRepository<Timeslot, Long> {
    List<Timeslot> findAllByDoctorAndStatusAndStartTimeUtcBetween(
        Doctor doctor,
        TimeslotStatus status,
        Instant from,
        Instant to
    );

    boolean existsByDoctorAndStartTimeUtcAndEndTimeUtc(
        Doctor doctor,
        Instant start,
        Instant end
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("Select t from Timeslot t WHERE t.id = :id")
    Optional<Timeslot> findByIdForUpdate(Long id);
}
