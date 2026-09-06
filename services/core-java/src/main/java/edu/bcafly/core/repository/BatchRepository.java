package edu.bcafly.core.repository;

import edu.bcafly.core.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, String> {
    List<Batch> findByActiveTrue();
    Optional<Batch> findByName(String name);
}
