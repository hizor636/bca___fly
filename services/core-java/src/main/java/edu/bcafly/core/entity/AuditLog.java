package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @Column(name = "event_id")
    private String eventId;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "actor_user_id", nullable = false)
    private String actorUserId;

    @Column(name = "actor_role", nullable = false)
    private String actorRole;

    @Column(nullable = false)
    private String action;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address")
    private String ipAddress;
}
