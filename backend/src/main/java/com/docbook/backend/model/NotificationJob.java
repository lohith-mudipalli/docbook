package com.docbook.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notification_jobs", indexes = {
    @Index(name = "idx_job_status_next", columnList = "status, nextAttemptAtUtc")
})
public class NotificationJob {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Example, APPOINTMENT_BOOKED_EMAIL
    @Column(nullable = false)
    private String type; 

    @Column(nullable = false)
    private String toEmail;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Column(nullable = false)
    private int attempts;

    @Column(nullable = false) 
    private Instant nextAttemptAtUtc;

    @Column(nullable = false)
    private Instant createdAtUtc;

    public NotificationJob() {}

    public NotificationJob(String type, String toEmail, String subject, String body, NotificationStatus status, int attempts, Instant nextAttemptAtUtc, Instant createdAtUtc) {
        this.type = type;
        this.toEmail = toEmail;
        this.subject = subject;
        this.body = body;
        this.status = status;
        this.attempts = attempts;
        this.nextAttemptAtUtc = nextAttemptAtUtc;
        this.createdAtUtc = createdAtUtc;
    }

    public Long getId() { return id; }
    public String getType() { return type; }
    public String getToEmail() { return toEmail; }
    public String getSubject() { return subject; }
    public String getBody() { return body; }
    public NotificationStatus getStatus() { return status; }
    public int getAttempts() { return attempts; }
    public Instant getNextAttemptAtUtc() { return nextAttemptAtUtc; }
    public Instant getCreatedAtUtc() { return createdAtUtc; }

    public void setStatus(NotificationStatus status) { this.status = status; }
    public void setAttempts(int attempts) { this.attempts = attempts; }
    public void setNextAttemptAtUtc(Instant nextAttemptAtUtc) { this.nextAttemptAtUtc = nextAttemptAtUtc; } 

}
