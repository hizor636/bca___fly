package edu.bcafly.core.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyProfile {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private String designation = "Assistant Professor";

    @Column(nullable = false)
    @Builder.Default
    private String department = "BCA";

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String office;

    @Column(name = "assigned_students_count")
    @Builder.Default
    private int assignedStudentsCount = 0;

    @Builder.Default
    private String specialization = "Computer Applications";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "archived_at")
    private LocalDateTime archivedAt;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
