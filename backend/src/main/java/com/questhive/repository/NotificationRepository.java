package com.questhive.repository;

import com.questhive.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByRecipientRoleAndRecipientIdOrderByDateDesc(String role, String recipientId);
}
