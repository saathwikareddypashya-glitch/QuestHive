package com.questhive.repository;

import com.questhive.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByTeacherIdOrderByDateDesc(String teacherId);
    List<Review> findByLearnerId(String learnerId);
}
