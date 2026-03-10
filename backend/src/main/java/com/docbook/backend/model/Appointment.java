package com.docbook.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_appt_doctor_start", columnList = "doctor_id, startTimeUtc"),
    @Index(name = "idx_appt_patient", columnList = "patient_id")
})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    
    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @Column(nullable = false)
    private Instant startTimeUtc;

    @Column(nullable = false)
    private Instant endTimeUtc;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppointmentStatus status;

    public Appointment() {}

    public Appointment(Doctor doctor, User patient, Instant startTimeUtc, Instant endTimeUtc, AppointmentStatus status) {
        this.doctor = doctor;
        this.patient = patient;
        this.startTimeUtc = startTimeUtc;
        this.endTimeUtc = endTimeUtc;
        this.status = status;
    }

    public Long getId() { return id; }
    public Doctor getDoctor() { return doctor; }
    public User getPatient() { return patient; }
    public Instant getStartTimeUtc() { return startTimeUtc; }
    public Instant getEndTimeUtc() { return endTimeUtc; }
    public AppointmentStatus getStatus() { return status; }

    public void setStatus(AppointmentStatus status) { this.status = status; }
}
