package com.docbook.backend.repository;

import com.docbook.backend.model.Doctor;
import com.docbook.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);    
}
