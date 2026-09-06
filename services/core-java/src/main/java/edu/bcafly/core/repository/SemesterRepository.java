package edu.bcafly.core.repository;

import edu.bcafly.core.entity.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, String> {
    List<Semester> findByActiveTrueOrderByNumberAsc();
    Optional<Semester> findByNumber(int number);
}
