package com.questhive.repository;

import com.questhive.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByLearnerId(String learnerId);
    List<Payment> findByTeacherId(String teacherId);
    Optional<Payment> findFirstByBookingId(String bookingId);
}
