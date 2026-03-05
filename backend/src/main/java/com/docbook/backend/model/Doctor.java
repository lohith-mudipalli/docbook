package com.docbook.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String specialization;

    public Doctor() {}

    public Doctor(User user, String displayName, String specialization) {
        this.user = user;
        this.displayName = displayName;
        this.specialization = specialization;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getDisplayName() { return displayName; }
    public String getSpecialization() { return specialization; }

    public void setUser(User user) { this.user = user; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
}