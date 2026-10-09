package com.questhive.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    private String id;
    private String recipientRole;   // learner | teacher | admin
    private String recipientId;
    private String type;            // booking | approval | review | reminder | application | payment | info
    @Column(length = 500)
    private String message;
    @Column(name = "created_at")
    private String date;
    @Column(name = "is_read")
    private boolean read;
    private String link;

    public Notification() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}
