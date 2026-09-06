package edu.bcafly.core.service;

import edu.bcafly.core.entity.AuditLog;
import edu.bcafly.core.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuditLog logEvent(String actorUserId, String actorRole, String action, String entityType, String entityId, String details, String ipAddress) {
        AuditLog entry = AuditLog.builder()
                .eventId("EVT-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .timestamp(LocalDateTime.now())
                .actorUserId(actorUserId != null ? actorUserId : "ADMIN")
                .actorRole(actorRole != null ? actorRole : "ADMIN")
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .build();
        return auditLogRepository.save(entry);
    }
}
