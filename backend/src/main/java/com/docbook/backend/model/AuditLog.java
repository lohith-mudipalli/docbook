package com.docbook.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_actor_time", columnList = "actorUserId, createdAtUtc")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long actorUserId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    @Column(nullable = false)
    private Long entityId;

    @Column(nullable = false)
    private Instant createdAtUtc;

    @Column(columnDefinition = "TEXT")
    private String metadataJSon;

    public AuditLog() { }

    public AuditLog(Long actorUserId, String action, String entityType, Long entityId, Instant createdAtUtc, String metadataJson) {
        this.actorUserId = actorUserId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.createdAtUtc = createdAtUtc;
        this.metadataJSon = metadataJson;
    }

    public Long getId() { return id; }

    
}
