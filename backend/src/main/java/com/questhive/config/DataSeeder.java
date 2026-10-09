package com.questhive.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questhive.entity.*;
import com.questhive.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Supplier;

/**
 * Loads demo data from src/main/resources/seed.json the first time the app starts (empty database).
 * Dates are shifted by whole weeks so "upcoming" classes stay in the future and still fall on the
 * teacher's teaching days, whenever you run the project.
 */
@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final TeacherRepository teachers;
    private final LearnerRepository learners;
    private final BookingRepository bookings;
    private final PaymentRepository payments;
    private final ReviewRepository reviews;
    private final NotificationRepository notifications;
    private final CategoryRepository categories;
    private final ObjectMapper mapper;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.password:demo1234}")
    private String demoPassword;

    public static class SeedData {
        private String generatedOn;
        private List<Teacher> teachers = new ArrayList<>();
        private List<Learner> learners = new ArrayList<>();
        private List<Booking> bookings = new ArrayList<>();
        private List<Payment> payments = new ArrayList<>();
        private List<Review> reviews = new ArrayList<>();
        private List<Notification> notifications = new ArrayList<>();
        private List<Category> categories = new ArrayList<>();

        public String getGeneratedOn() { return generatedOn; }
        public void setGeneratedOn(String generatedOn) { this.generatedOn = generatedOn; }
        public List<Teacher> getTeachers() { return teachers; }
        public void setTeachers(List<Teacher> teachers) { this.teachers = teachers; }
        public List<Learner> getLearners() { return learners; }
        public void setLearners(List<Learner> learners) { this.learners = learners; }
        public List<Booking> getBookings() { return bookings; }
        public void setBookings(List<Booking> bookings) { this.bookings = bookings; }
        public List<Payment> getPayments() { return payments; }
        public void setPayments(List<Payment> payments) { this.payments = payments; }
        public List<Review> getReviews() { return reviews; }
        public void setReviews(List<Review> reviews) { this.reviews = reviews; }
        public List<Notification> getNotifications() { return notifications; }
        public void setNotifications(List<Notification> notifications) { this.notifications = notifications; }
        public List<Category> getCategories() { return categories; }
        public void setCategories(List<Category> categories) { this.categories = categories; }
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (teachers.count() > 0) {
            backfillPasswords();
            log.info("QuestHive database already has data — skipping seed.");
            return;
        }
        seed();
    }

    @Transactional
    public void reset() throws Exception {
        notifications.deleteAllInBatch();
        reviews.deleteAllInBatch();
        payments.deleteAllInBatch();
        bookings.deleteAllInBatch();
        learners.deleteAllInBatch();
        teachers.deleteAll();     // also clears the element-collection tables
        categories.deleteAll();
        teachers.flush();
        categories.flush();
        seed();
    }

    private void seed() throws Exception {
        SeedData data;
        try (InputStream in = openSeedFile()) {
            data = mapper.readValue(in, SeedData.class);
        }
        long days = ChronoUnit.DAYS.between(LocalDate.parse(data.getGeneratedOn()), LocalDate.now());
        long shift = Math.round(days / 7.0) * 7;

        for (Teacher t : data.getTeachers()) {
            shiftDate(t::getJoinedAt, t::setJoinedAt, shift);
            shiftDate(t::getSubmittedAt, t::setSubmittedAt, shift);
            shiftDate(t::getVerifiedAt, t::setVerifiedAt, shift);
        }
        data.getLearners().forEach(l -> shiftDate(l::getJoinedAt, l::setJoinedAt, shift));
        for (Booking b : data.getBookings()) {
            shiftDate(b::getDate, b::setDate, shift);
            shiftInstant(b::getCreatedAt, b::setCreatedAt, shift);
        }
        data.getPayments().forEach(p -> shiftInstant(p::getDate, p::setDate, shift));
        data.getReviews().forEach(r -> shiftDate(r::getDate, r::setDate, shift));
        data.getNotifications().forEach(n -> shiftInstant(n::getDate, n::setDate, shift));

        String hash = passwordEncoder.encode(demoPassword);
        data.getTeachers().forEach(t -> t.setPasswordHash(hash));
        data.getLearners().forEach(l -> l.setPasswordHash(hash));

        categories.saveAll(data.getCategories());
        teachers.saveAll(data.getTeachers());
        learners.saveAll(data.getLearners());
        bookings.saveAll(data.getBookings());
        payments.saveAll(data.getPayments());
        reviews.saveAll(data.getReviews());
        notifications.saveAll(data.getNotifications());
        log.info("Seeded QuestHive demo data: {} teachers, {} learners, {} bookings (dates shifted {} days).",
                data.getTeachers().size(), data.getLearners().size(), data.getBookings().size(), shift);
    }

    /**
     * Finds seed.json: normally on the classpath (copied to target/classes by the build).
     * Falls back to the source folder in case the IDE build didn't copy resources.
     */
    private InputStream openSeedFile() throws IOException {
        ClassPathResource resource = new ClassPathResource("seed.json");
        if (resource.exists()) return resource.getInputStream();
        for (Path candidate : List.of(Path.of("src", "main", "resources", "seed.json"),
                                      Path.of("backend", "src", "main", "resources", "seed.json"))) {
            if (Files.exists(candidate)) {
                log.warn("seed.json was not on the classpath — loading it from {}. (Build → Rebuild Project fixes this.)", candidate.toAbsolutePath());
                return Files.newInputStream(candidate);
            }
        }
        throw new IOException("seed.json not found. It should be in backend/src/main/resources/seed.json.");
    }

    /** Databases created before passwords existed: give demo accounts the demo password. */
    private void backfillPasswords() {
        String hash = passwordEncoder.encode(demoPassword);
        teachers.findAll().stream().filter(t -> t.getPasswordHash() == null).forEach(t -> t.setPasswordHash(hash));
        learners.findAll().stream().filter(l -> l.getPasswordHash() == null).forEach(l -> l.setPasswordHash(hash));
    }

    private static void shiftDate(Supplier<String> get, Consumer<String> set, long days) {
        String v = get.get();
        if (v != null && v.length() >= 10) set.accept(LocalDate.parse(v.substring(0, 10)).plusDays(days).toString());
    }

    private static void shiftInstant(Supplier<String> get, Consumer<String> set, long days) {
        String v = get.get();
        if (v != null && v.contains("T")) set.accept(Instant.parse(v).plus(days, ChronoUnit.DAYS).toString());
    }

    public DataSeeder(TeacherRepository teachers, LearnerRepository learners, BookingRepository bookings, PaymentRepository payments, ReviewRepository reviews, NotificationRepository notifications, CategoryRepository categories, ObjectMapper mapper, PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
        this.teachers = teachers;
        this.learners = learners;
        this.bookings = bookings;
        this.payments = payments;
        this.reviews = reviews;
        this.notifications = notifications;
        this.categories = categories;
        this.mapper = mapper;
    }
}
