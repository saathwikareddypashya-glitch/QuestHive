package com.questhive.service;

import com.questhive.dto.Requests.*;
import com.questhive.dto.Responses.UserDto;
import com.questhive.entity.Learner;
import com.questhive.entity.Teacher;
import com.questhive.exception.ApiException;
import com.questhive.repository.BookingRepository;
import com.questhive.repository.LearnerRepository;
import com.questhive.repository.PaymentRepository;
import com.questhive.repository.TeacherRepository;
import com.questhive.util.AppUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Email + password authentication. Passwords are checked against BCrypt hashes stored in the database.
 * Learners sign up on /register; teachers apply on /register/teacher and can sign in once approved;
 * the admin account is configured in application.properties.
 */
@Service
public class AuthService {
    private final LearnerRepository learners;
    private final TeacherRepository teachers;
    private final BookingRepository bookings;
    private final PaymentRepository payments;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;
    @Value("${app.admin.password}")
    private String adminPassword;

    public AuthService(LearnerRepository learners, TeacherRepository teachers, BookingRepository bookings,
                       PaymentRepository payments, PasswordEncoder passwordEncoder) {
        this.learners = learners;
        this.teachers = teachers;
        this.bookings = bookings;
        this.payments = payments;
        this.passwordEncoder = passwordEncoder;
    }

    private static ApiException unauthorized(String message) {
        return new ApiException(HttpStatus.UNAUTHORIZED, message);
    }

    private boolean passwordMatches(String raw, String hash) {
        return hash != null && passwordEncoder.matches(raw, hash);
    }

    public UserDto toUser(Learner l) {
        return new UserDto(l.getId(), "learner", l.getName(), l.getEmail(), l.getAvatar());
    }

    public UserDto toUser(Teacher t) {
        return new UserDto(t.getId(), "teacher", t.getName(), t.getEmail(), t.getImage());
    }

    public UserDto login(LoginRequest req) {
        String email = req.email().trim();
        switch (req.role()) {
            case "learner" -> {
                Learner l = learners.findFirstByEmailIgnoreCase(email)
                        .orElseThrow(() -> unauthorized("No learner account found with this email. Create one first."));
                if (!passwordMatches(req.password(), l.getPasswordHash())) throw unauthorized("Incorrect password. Please try again.");
                return toUser(l);
            }
            case "teacher" -> {
                Teacher t = teachers.findFirstByEmailIgnoreCase(email)
                        .orElseThrow(() -> unauthorized("No teacher account found with this email. Apply to teach first."));
                if (!passwordMatches(req.password(), t.getPasswordHash())) throw unauthorized("Incorrect password. Please try again.");
                if ("pending".equals(t.getStatus()))
                    throw new ApiException(HttpStatus.FORBIDDEN, "Your application is still being reviewed. You can sign in once it is approved.");
                if ("rejected".equals(t.getStatus()))
                    throw new ApiException(HttpStatus.FORBIDDEN, "Your application was not approved: " + t.getRejectionReason());
                return toUser(t);
            }
            case "admin" -> {
                if (!adminEmail.equalsIgnoreCase(email) || !adminPassword.equals(req.password()))
                    throw unauthorized("Incorrect admin email or password.");
                return new UserDto("admin", "admin", "Admin", adminEmail, "");
            }
            default -> throw ApiException.badRequest("Unknown account type.");
        }
    }

    @Transactional
    public UserDto register(RegisterRequest req) {
        String email = req.email().trim();
        if (learners.existsByEmailIgnoreCase(email))
            throw ApiException.conflict("An account with this email already exists. Sign in instead.");
        Learner l = new Learner();
        l.setId(AppUtils.uid("L"));
        l.setName(req.name().trim());
        l.setEmail(email);
        l.setPasswordHash(passwordEncoder.encode(req.password()));
        l.setGender(req.gender() == null ? "Other" : req.gender());
        l.setAvatar("");
        l.setRating(5);
        l.setRatingNote("New to QuestHive.");
        l.setJoinedAt(AppUtils.today());
        learners.save(l);
        return toUser(l);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest req) {
        switch (req.role()) {
            case "learner" -> {
                Learner l = getLearner(req.userId());
                if (!passwordMatches(req.currentPassword(), l.getPasswordHash())) throw unauthorized("Your current password is incorrect.");
                l.setPasswordHash(passwordEncoder.encode(req.newPassword()));
            }
            case "teacher" -> {
                Teacher t = teachers.findById(req.userId()).orElseThrow(() -> ApiException.notFound("account"));
                if (!passwordMatches(req.currentPassword(), t.getPasswordHash())) throw unauthorized("Your current password is incorrect.");
                t.setPasswordHash(passwordEncoder.encode(req.newPassword()));
            }
            default -> throw ApiException.badRequest("The admin password is set in application.properties.");
        }
    }

    public Learner getLearner(String id) {
        return learners.findById(id).orElseThrow(() -> ApiException.notFound("account"));
    }

    @Transactional
    public Learner updateLearner(String id, LearnerUpdateRequest req) {
        Learner l = getLearner(id);
        if (req.name() != null && !req.name().isBlank()) {
            l.setName(req.name().trim());
            bookings.findByLearnerId(id).forEach(b -> b.setLearnerName(l.getName()));
            payments.findByLearnerId(id).forEach(p -> p.setLearnerName(l.getName()));
        }
        if (req.email() != null && !req.email().isBlank()) {
            String email = req.email().trim();
            if (!email.equalsIgnoreCase(l.getEmail()) && learners.existsByEmailIgnoreCase(email))
                throw ApiException.conflict("Another account already uses this email.");
            l.setEmail(email);
        }
        if (req.gender() != null) l.setGender(req.gender());
        if (req.avatar() != null) l.setAvatar(req.avatar());
        if (req.location() != null) l.setLocation(req.location());
        return l;
    }
}
