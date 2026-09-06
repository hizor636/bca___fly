package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "batches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "department_id", nullable = false)
    @Builder.Default
    private String departmentId = "BCA";

    @Column(name = "academic_year", nullable = false)
    @Builder.Default
    private String academicYear = "2026-2027";

    @Column(nullable = false)
    @Builder.Default
    private String section = "A";

    @Builder.Default
    private String shift = "Day";

    @Column(name = "start_year")
    @Builder.Default
    private int startYear = 2026;

    @Column(name = "end_year")
    @Builder.Default
    private int endYear = 2029;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "archived_by")
    private String archivedBy;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
