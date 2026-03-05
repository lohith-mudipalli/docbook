package com.docbook.backend.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "timeslots", indexes = {
    @Index(name = "idx_timeslot_doctor_start", columnList = "doctor_id, startTimeUtc")
})
public class Timeslot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(nullable = false)
    private Instant startTimeUtc;

    @Column(nullable = false)
    private Instant endTimeUtc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeslotStatus status;

    public Timeslot() {}

    public Timeslot(Doctor doctor, Instant startTimeUtc, Instant endTimeUtc, TimeslotStatus status) {
        this.doctor = doctor;
        this.startTimeUtc = startTimeUtc;
        this.endTimeUtc = endTimeUtc;
        this.status = status;
    }

    public Long getId() { return id; }
    public Doctor getDoctor() { return doctor; }
    public Instant getStartTimeUtc() { return startTimeUtc; }
    public Instant getEndTimeUtc() { return endTimeUtc; }
    public TimeslotStatus getStatus() { return status; }

    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public void setStartTimeUtc(Instant startTimeUtc) { this.startTimeUtc = startTimeUtc; }
    public void setEndTimeUtc(Instant endTimeUtc) { this.endTimeUtc = endTimeUtc; }
    public void setStatus(TimeslotStatus status) { this.status = status; }
}
