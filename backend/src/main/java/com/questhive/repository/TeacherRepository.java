package com.questhive.repository;

import com.questhive.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, String> {
    List<Teacher> findByStatusIn(List<String> statuses);
    List<Teacher> findBySubmittedAtIsNotNull();
    long countByStatus(String status);
    boolean existsByEmailIgnoreCase(String email);
    Optional<Teacher> findFirstByEmailIgnoreCase(String email);
}
