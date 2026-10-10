package com.questhive.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questhive.entity.*;
import com.questhive.exception.ApiException;
import com.questhive.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
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
    private final JdbcTemplate jdbc;

    @PersistenceContext
    private EntityManager em;

    /** Prevents two resets running at the same time (e.g. a double click). */
    private final AtomicBoolean resetting = new AtomicBoolean(false);

    /** Child tables first, so nothing points at a deleted row. */
    private static final List<String> TABLES = List.of(
            "teacher_qualifications", "teacher_skills", "teacher_languages", "teacher_availability",
            "category_subjects", "notifications", "reviews", "payments", "bookings",
            "learners", "teachers", "categories");

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

    /**
     * Restores the original demo data. Deletes every table with one SQL statement each, then
     * inserts the seed data in JDBC batches, so it is quick even on a remote cloud database.
     */
    @Transactional
    public void reset() throws Exception {
        if (!resetting.compareAndSet(false, true))
            throw new ApiException(HttpStatus.CONFLICT, "A reset is already running. Wait a minute, then refresh the page.");
        try {
            long start = System.currentTimeMillis();
            em.flush();
            em.clear();
            for (String table : TABLES) jdbc.update("DELETE FROM " + table);
            seed();
            log.info("Demo data reset in {} ms.", System.currentTimeMillis() - start);
        } finally {
            resetting.set(false);
        }
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

        persistAll(data.getCategories());
        persistAll(data.getTeachers());
        persistAll(data.getLearners());
        persistAll(data.getBookings());
        persistAll(data.getPayments());
        persistAll(data.getReviews());
        persistAll(data.getNotifications());
        log.info("Seeded QuestHive demo data: {} teachers, {} learners, {} bookings (dates shifted {} days).",
                data.getTeachers().size(), data.getLearners().size(), data.getBookings().size(), shift);
    }

    /** Inserts new rows directly (no SELECT first) and flushes in batches of 50. */
    private void persistAll(List<?> items) {
        int i = 0;
        for (Object item : items) {
            em.persist(item);
            if (++i % 50 == 0) {
                em.flush();
                em.clear();
            }
        }
        em.flush();
        em.clear();
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

    public DataSeeder(TeacherRepository teachers, LearnerRepository learners, BookingRepository bookings, PaymentRepository payments, ReviewRepository reviews, NotificationRepository notifications, CategoryRepository categories, ObjectMapper mapper, PasswordEncoder passwordEncoder, JdbcTemplate jdbc) {
        this.jdbc = jdbc;
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
