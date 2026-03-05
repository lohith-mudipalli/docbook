package com.docbook.backend.model;

import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
@Table(name = "doctor_availability")
public class DoctorAvailability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    // 1=Monday ... 7=Sunday (ISO standard)
    @Column(nullable = false)
    private int dayOfWeek;

    @Column(nullable = false)
    private LocalTime startLocal;

    @Column(nullable = false)
    private LocalTime endLocal;

    @Column(nullable = false)
    private int slotMinutes;

    public DoctorAvailability() {}

    public DoctorAvailability(Doctor doctor, int dayOfWeek, LocalTime startLocal, LocalTime endLocal, int slotMinutes) {
        this.doctor = doctor;
        this.dayOfWeek = dayOfWeek;
        this.startLocal = startLocal;
        this.endLocal = endLocal;
        this.slotMinutes = slotMinutes;
    }

    public Long getId() { return id; }
    public Doctor getDoctor() { return doctor; }
    public int getDayOfWeek() { return dayOfWeek; }
    public LocalTime getStartLocal() { return startLocal; }
    public LocalTime getEndLocal() { return endLocal; }
    public int getSlotMinutes() { return slotMinutes; }

    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public void setDayOfWeek(int dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public void setStartLocal(LocalTime startLocal) { this.startLocal = startLocal; }
    public void setEndLocal(LocalTime endLocal) { this.endLocal = endLocal; }
    public void setSlotMinutes(int slotMinutes) { this.slotMinutes = slotMinutes; }

}
