package com.questhive.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "learners")
public class Learner {
    @Id
    private String id;
    private String name;
    private String email;
    private String gender;
    @Lob
    private String avatar;
    private double rating;
    private String ratingNote;
    private String joinedAt;
    private String location;

    /** BCrypt hash — never serialized to JSON. */
    @JsonIgnore
    @Column(length = 100)
    private String passwordHash;

    public Learner() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public String getRatingNote() { return ratingNote; }
    public void setRatingNote(String ratingNote) { this.ratingNote = ratingNote; }
    public String getJoinedAt() { return joinedAt; }
    public void setJoinedAt(String joinedAt) { this.joinedAt = joinedAt; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
