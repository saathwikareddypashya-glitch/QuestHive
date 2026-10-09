package com.questhive.service;

import com.questhive.entity.Notification;
import com.questhive.exception.ApiException;
import com.questhive.repository.NotificationRepository;
import com.questhive.util.AppUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository repo;

    public List<Notification> getFor(String role, String userId) {
        return repo.findByRecipientRoleAndRecipientIdOrderByDateDesc(role, userId);
    }

    /** Creates a notification; called by the other services whenever something happens. */
    public void notify(String role, String recipientId, String type, String message, String link) {
        Notification n = new Notification();
        n.setId(AppUtils.uid("n"));
        n.setRecipientRole(role);
        n.setRecipientId(recipientId);
        n.setType(type);
        n.setMessage(message);
        n.setLink(link);
        n.setDate(AppUtils.nowIso());
        n.setRead(false);
        repo.save(n);
    }

    @Transactional
    public void markAllRead(String role, String userId) {
        getFor(role, userId).forEach(n -> n.setRead(true));
    }

    @Transactional
    public void markRead(String id) {
        repo.findById(id).orElseThrow(() -> ApiException.notFound("notification")).setRead(true);
    }

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }
}
