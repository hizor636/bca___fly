package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "semesters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Semester {

    @Id
    private String id;

    @Column(nullable = false)
    private int number;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int year;

    @Column(name = "typical_status")
    private String typicalStatus;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    @Builder.Default
    private int credits = 24;

    @Column(name = "min_attendance")
    @Builder.Default
    private double minAttendance = 75.0;

    @Column(name = "is_current")
    @Builder.Default
    private boolean current = false;

    @Column(name = "total_enrolled")
    @Builder.Default
    private int totalEnrolled = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;
}
