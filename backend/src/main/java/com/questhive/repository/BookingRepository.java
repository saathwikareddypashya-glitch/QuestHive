package com.questhive.repository;

import com.questhive.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByLearnerId(String learnerId);
    List<Booking> findByTeacherId(String teacherId);
    List<Booking> findByTeacherIdAndDateAndStatus(String teacherId, String date, String status);
    boolean existsByTeacherIdAndDateAndTimeAndStatus(String teacherId, String date, String time, String status);
    boolean existsByTeacherIdAndLearnerId(String teacherId, String learnerId);
    boolean existsByLearnerIdAndTeacherIdAndStatusNot(String learnerId, String teacherId, String status);
}
