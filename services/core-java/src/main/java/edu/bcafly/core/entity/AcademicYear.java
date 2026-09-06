package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "academic_years")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicYear {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "attendance_rule")
    @Builder.Default
    private double attendanceRule = 75.0;

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
