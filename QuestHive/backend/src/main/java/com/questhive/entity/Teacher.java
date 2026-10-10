package com.questhive.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teachers")
public class Teacher {
    @Id
    private String id;
    private String name;
    private String gender;
    private String email;

    @Lob
    private String image;           // URL, local path or uploaded data URL
    @Column(length = 500)
    private String imageFallback;

    private String location;
    private boolean online;
    private String subject;
    private String category;
    private double rating;
    private int reviewCount;

    @Column(length = 1000)
    private String description;
    @Lob
    private String bio;

    private int price;
    private int experienceYears;

    @ElementCollection
    @OrderColumn(name = "list_index")
    @CollectionTable(name = "teacher_qualifications", joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "qualification", length = 500)
    @Fetch(FetchMode.SUBSELECT)
    private List<String> qualifications = new ArrayList<>();

    @ElementCollection
    @OrderColumn(name = "list_index")
    @CollectionTable(name = "teacher_skills", joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "skill")
    @Fetch(FetchMode.SUBSELECT)
    private List<String> skills = new ArrayList<>();

    @ElementCollection
    @OrderColumn(name = "list_index")
    @CollectionTable(name = "teacher_languages", joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "language")
    @Fetch(FetchMode.SUBSELECT)
    private List<String> languages = new ArrayList<>();

    @Lob
    private String teachingStyle;

    private boolean verified;
    private String status;          // verified | unverified | pending | rejected
    private boolean firstClassFree;
    private int studentCount;
    private int completedClasses;

    @ElementCollection
    @OrderColumn(name = "list_index")
    @CollectionTable(name = "teacher_availability", joinColumns = @JoinColumn(name = "teacher_id"))
    @Fetch(FetchMode.SUBSELECT)
    private List<AvailabilityRange> availability = new ArrayList<>();

    private int classDurationMins;
    private String joinedAt;
    private String submittedAt;
    private String verifiedAt;

    @Lob
    private String certificate;
    private String certificateName;
    @Column(length = 1000)
    private String rejectionReason;

    /** BCrypt hash — never serialized to JSON. */
    @JsonIgnore
    @Column(length = 100)
    private String passwordHash;

    @JsonIgnore
    public boolean isPublic() {
        return "verified".equals(status) || "unverified".equals(status);
    }

    public Teacher() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getImageFallback() { return imageFallback; }
    public void setImageFallback(String imageFallback) { this.imageFallback = imageFallback; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }
    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }
    public List<String> getQualifications() { return qualifications; }
    public void setQualifications(List<String> qualifications) { this.qualifications = qualifications; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public List<String> getLanguages() { return languages; }
    public void setLanguages(List<String> languages) { this.languages = languages; }
    public String getTeachingStyle() { return teachingStyle; }
    public void setTeachingStyle(String teachingStyle) { this.teachingStyle = teachingStyle; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isFirstClassFree() { return firstClassFree; }
    public void setFirstClassFree(boolean firstClassFree) { this.firstClassFree = firstClassFree; }
    public int getStudentCount() { return studentCount; }
    public void setStudentCount(int studentCount) { this.studentCount = studentCount; }
    public int getCompletedClasses() { return completedClasses; }
    public void setCompletedClasses(int completedClasses) { this.completedClasses = completedClasses; }
    public List<AvailabilityRange> getAvailability() { return availability; }
    public void setAvailability(List<AvailabilityRange> availability) { this.availability = availability; }
    public int getClassDurationMins() { return classDurationMins; }
    public void setClassDurationMins(int classDurationMins) { this.classDurationMins = classDurationMins; }
    public String getJoinedAt() { return joinedAt; }
    public void setJoinedAt(String joinedAt) { this.joinedAt = joinedAt; }
    public String getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
    public String getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(String verifiedAt) { this.verifiedAt = verifiedAt; }
    public String getCertificate() { return certificate; }
    public void setCertificate(String certificate) { this.certificate = certificate; }
    public String getCertificateName() { return certificateName; }
    public void setCertificateName(String certificateName) { this.certificateName = certificateName; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
