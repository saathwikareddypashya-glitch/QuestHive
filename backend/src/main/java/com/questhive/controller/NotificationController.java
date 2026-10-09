package com.questhive.controller;

import com.questhive.dto.Requests.ReadAllRequest;
import com.questhive.entity.Notification;
import com.questhive.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notifications;

    @GetMapping
    public List<Notification> list(@RequestParam String role, @RequestParam String userId) {
        return notifications.getFor(role, userId);
    }

    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void readAll(@Valid @RequestBody ReadAllRequest req) {
        notifications.markAllRead(req.role(), req.userId());
    }

    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void read(@PathVariable String id) {
        notifications.markRead(id);
    }

    public NotificationController(NotificationService notifications) {
        this.notifications = notifications;
    }
}
