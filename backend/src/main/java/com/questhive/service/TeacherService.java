package com.questhive.service;

import com.questhive.dto.Requests.*;
import com.questhive.dto.Responses.SlotDto;
import com.questhive.entity.Booking;
import com.questhive.entity.Review;
import com.questhive.entity.Teacher;
import com.questhive.exception.ApiException;
import com.questhive.repository.BookingRepository;
import com.questhive.repository.ReviewRepository;
import com.questhive.repository.TeacherRepository;
import com.questhive.util.AppUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TeacherService {
    private final TeacherRepository teachers;
    private final BookingRepository bookings;
    private final ReviewRepository reviews;
    private final NotificationService notifications;
    private final PasswordEncoder passwordEncoder;

    public List<Teacher> getPublic() {
        return teachers.findByStatusIn(List.of("verified", "unverified"));
    }

    public List<Teacher> getAll() {
        return teachers.findAll();
    }

    public Teacher get(String id) {
        return teachers.findById(id).orElseThrow(() -> ApiException.notFound("teacher"));
    }

    public List<Review> getReviews(String teacherId) {
        return reviews.findByTeacherIdOrderByDateDesc(teacherId);
    }

    /** Slots for one date = generated from weekly availability, minus booked and past times. */
    @Transactional(readOnly = true)
    public List<SlotDto> getSlots(String teacherId, String date) {
        Teacher t = get(teacherId);
        Set<String> booked = bookings.findByTeacherIdAndDateAndStatus(teacherId, date, "upcoming").stream()
                .map(Booking::getTime).collect(Collectors.toSet());
        List<SlotDto> out = new ArrayList<>();
        for (String time : AppUtils.generateSlots(t.getAvailability(), AppUtils.dayOf(date), t.getClassDurationMins())) {
            if (booked.contains(time)) out.add(new SlotDto(time, false, "booked"));
            else if (AppUtils.isPast(date, time)) out.add(new SlotDto(time, false, "past"));
            else out.add(new SlotDto(time, true, null));
        }
        return out;
    }

    @Transactional
    public Teacher updateProfile(String id, TeacherUpdateRequest r) {
        Teacher t = get(id);
        if (r.name() != null && !r.name().isBlank()) {
            t.setName(r.name().trim());
            bookings.findByTeacherId(id).forEach(b -> b.setTeacherName(t.getName()));
        }
        if (r.image() != null) t.setImage(r.image());
        if (r.imageFallback() != null) t.setImageFallback(r.imageFallback());
        if (r.location() != null) t.setLocation(r.location());
        if (r.online() != null) t.setOnline(r.online());
        if (r.description() != null) t.setDescription(r.description());
        if (r.bio() != null) t.setBio(r.bio());
        if (r.price() != null) {
            if (r.price() < 200) throw ApiException.badRequest("Price must be at least ₹200.");
            t.setPrice(r.price());
        }
        if (r.experienceYears() != null) t.setExperienceYears(r.experienceYears());
        if (r.teachingStyle() != null) t.setTeachingStyle(r.teachingStyle());
        if (r.firstClassFree() != null) t.setFirstClassFree(r.firstClassFree());
        if (r.skills() != null) { t.getSkills().clear(); t.getSkills().addAll(r.skills()); }
        if (r.qualifications() != null) { t.getQualifications().clear(); t.getQualifications().addAll(r.qualifications()); }
        return t;
    }

    @Transactional
    public Teacher updateAvailability(String id, AvailabilityRequest r) {
        Teacher t = get(id);
        t.getAvailability().clear();
        t.getAvailability().addAll(r.availability());
        if (r.classDurationMins() != null) t.setClassDurationMins(r.classDurationMins());
        return t;
    }

    @Transactional
    public Teacher apply(TeacherApplicationRequest a) {
        if (teachers.existsByEmailIgnoreCase(a.email()))
            throw ApiException.conflict("An application with this email already exists.");
        Teacher t = new Teacher();
        t.setId(AppUtils.uid("t"));
        t.setName(a.name().trim());
        t.setGender(a.gender());
        t.setEmail(a.email().trim());
        t.setPasswordHash(passwordEncoder.encode(a.password()));
        t.setImage(a.image());
        t.setLocation(a.location() == null || a.location().isBlank() ? "India" : a.location().trim());
        t.setOnline(true);
        t.setSubject(a.subject());
        t.setCategory(a.category());
        String firstSentence = a.bio().split("\\. ")[0];
        t.setDescription(firstSentence.length() > 120 ? firstSentence.substring(0, 120) : firstSentence);
        t.setBio(a.bio().trim());
        t.setPrice(a.price());
        t.setExperienceYears(a.experienceYears());
        if (a.qualifications() != null) t.getQualifications().addAll(a.qualifications());
        t.getSkills().add(a.subject());
        t.getLanguages().add("English");
        t.setTeachingStyle("Personalised one-to-one classes.");
        t.setStatus("pending");
        t.setVerified(false);
        t.setFirstClassFree(true);
        t.getAvailability().addAll(a.availability());
        t.setClassDurationMins(a.classDurationMins());
        t.setJoinedAt(AppUtils.today());
        t.setSubmittedAt(AppUtils.today());
        t.setCertificate(a.certificate());
        t.setCertificateName(a.certificateName());
        teachers.save(t);
        notifications.notify("admin", "admin", "application",
                "New teacher application from " + t.getName() + " (" + t.getSubject() + ").", "/admin/verification");
        return t;
    }

    public TeacherService(TeacherRepository teachers, BookingRepository bookings, ReviewRepository reviews, NotificationService notifications, PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.teachers = teachers;
        this.bookings = bookings;
        this.reviews = reviews;
        this.notifications = notifications;
    }
}
