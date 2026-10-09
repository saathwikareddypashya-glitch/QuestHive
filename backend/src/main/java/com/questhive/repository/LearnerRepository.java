package com.questhive.repository;

import com.questhive.entity.Learner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LearnerRepository extends JpaRepository<Learner, String> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<Learner> findFirstByEmailIgnoreCase(String email);
}
