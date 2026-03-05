package com.docbook.backend.controller;

import com.docbook.backend.service.DoctorService;
import com.docbook.backend.dto.AvailabilityRequest;
import com.docbook.backend.dto.CreateDoctorRequest;
import com.docbook.backend.repository.DoctorRepository;
import com.docbook.backend.model.Doctor;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final DoctorRepository doctorRepo;

    public DoctorController(DoctorService doctorService, DoctorRepository doctorRepo) {
        this.doctorService = doctorService;
        this.doctorRepo = doctorRepo;
    }

    //Patient can view all Doctors
    @GetMapping
    public List<Doctor> listDoctors() {
        return doctorRepo.findAll();
    }

    //Admin creates Doctor Profile and upgrades role to Doctor
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createDoctor(@Valid @RequestBody CreateDoctorRequest req) {
        Doctor doctor = doctorService.createDoctor(req);
        return ResponseEntity.ok(Map.of("doctorId", doctor.getId()));
    }

    //Doctor or Admin sets availability for a doctor
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')") 
    @PutMapping("/{doctorId}/availability")
    public ResponseEntity<?> setAvailability(@PathVariable Long doctorId, @RequestBody List<AvailabilityRequest> slots) {
        doctorService.setAvailability(doctorId, slots);
        return ResponseEntity.ok(Map.of("message", "availability_updated"));
    }


    
}
