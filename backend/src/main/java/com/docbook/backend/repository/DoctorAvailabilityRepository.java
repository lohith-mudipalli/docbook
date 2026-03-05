package com.docbook.backend.repository;

import com.docbook.backend.model.Doctor;
import com.docbook.backend.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long>  {
    List<DoctorAvailability> findAllByDoctor(Doctor doctor);
    void deleteAllByDoctor(Doctor doctor);
}
