package com.questhive.service;

import com.questhive.dto.Responses.*;
import com.questhive.entity.*;
import com.questhive.exception.ApiException;
import com.questhive.repository.*;
import com.questhive.util.AppUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final TeacherRepository teachers;
    private final LearnerRepository learners;
    private final BookingRepository bookings;
    private final PaymentRepository payments;
    private final ReviewRepository reviews;
    private final CategoryRepository categories;
    private final NotificationService notifications;

    @Value("${app.commission:0.15}")
    private double commission;

    private List<Payment> activePayments() {
        return payments.findAll().stream().filter(p -> !"Refunded".equals(p.getStatus())).toList();
    }

    public StatsDto stats() {
        List<Payment> paid = activePayments();
        List<Booking> allBookings = bookings.findAll();
        long gmv = paid.stream().mapToLong(Payment::getAmount).sum();

        List<MonthPoint> series = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            String key = ym.toString(); // 2026-10
            long monthGmv = paid.stream().filter(p -> key.equals(AppUtils.monthKey(p.getDate()))).mapToLong(Payment::getAmount).sum();
            long monthBookings = allBookings.stream().filter(b -> key.equals(AppUtils.monthKey(b.getCreatedAt()))).count();
            series.add(new MonthPoint(ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                    monthBookings, Math.round(monthGmv * commission), monthGmv));
        }
        long publicTeachers = teachers.findAll().stream().filter(Teacher::isPublic).count();
        return new StatsDto(learners.count(), publicTeachers, teachers.countByStatus("pending"),
                allBookings.size(), gmv, Math.round(gmv * commission), series);
    }

    public List<Teacher> applications() {
        return teachers.findBySubmittedAtIsNotNull().stream()
                .sorted(Comparator.comparing((Teacher t) -> !"pending".equals(t.getStatus()))
                        .thenComparing(Teacher::getSubmittedAt, Comparator.reverseOrder()))
                .toList();
    }

    @Transactional
    public Teacher approve(String id) {
        Teacher t = teachers.findById(id).orElseThrow(() -> ApiException.notFound("teacher"));
        t.setStatus("verified");
        t.setVerified(true);
        t.setVerifiedAt(AppUtils.today());
        t.setRejectionReason(null);
        notifications.notify("teacher", t.getId(), "approval",
                "Your teacher application has been approved. Your profile is now live.", "/teacher/verification");
        return t;
    }

    @Transactional
    public Teacher reject(String id, String reason) {
        Teacher t = teachers.findById(id).orElseThrow(() -> ApiException.notFound("teacher"));
        t.setStatus("rejected");
        t.setVerified(false);
        t.setRejectionReason(reason == null || reason.isBlank() ? "Your documents did not meet our verification requirements." : reason.trim());
        return t;
    }

    @Transactional
    public Teacher setStatus(String id, String status) {
        if (!Set.of("verified", "unverified", "pending", "rejected").contains(status)) throw ApiException.badRequest("Unknown status.");
        Teacher t = teachers.findById(id).orElseThrow(() -> ApiException.notFound("teacher"));
        t.setStatus(status);
        t.setVerified("verified".equals(status));
        return t;
    }

    public List<LearnerSummary> learnerSummaries() {
        List<Booking> allBookings = bookings.findAll();
        List<Payment> paid = activePayments();
        return learners.findAll().stream().map(l -> new LearnerSummary(
                l.getId(), l.getName(), l.getEmail(), l.getGender(), l.getAvatar(), l.getRating(), l.getRatingNote(),
                l.getJoinedAt(), l.getLocation(),
                allBookings.stream().filter(b -> b.getLearnerId().equals(l.getId())).count(),
                paid.stream().filter(p -> p.getLearnerId().equals(l.getId())).mapToLong(Payment::getAmount).sum()
        )).toList();
    }

    public List<Category> categories() {
        return categories.findAll();
    }

    @Transactional
    public Category addSubject(String categoryId, String name) {
        Category c = categories.findById(categoryId).orElseThrow(() -> ApiException.notFound("category"));
        String clean = name.trim();
        if (c.getSubjects().stream().anyMatch(s -> s.equalsIgnoreCase(clean)))
            throw ApiException.conflict(clean + " already exists in " + c.getShortName() + ".");
        c.getSubjects().add(clean);
        return c;
    }

    @Transactional
    public Category removeSubject(String categoryId, String name) {
        Category c = categories.findById(categoryId).orElseThrow(() -> ApiException.notFound("category"));
        c.getSubjects().removeIf(s -> s.equals(name));
        return c;
    }

    public ReportDto report() {
        List<Teacher> allTeachers = teachers.findAll();
        Map<String, String> categoryOfTeacher = allTeachers.stream()
                .collect(Collectors.toMap(Teacher::getId, t -> Objects.toString(t.getCategory(), "")));
        List<Booking> allBookings = bookings.findAll();
        List<Payment> paid = activePayments();
        List<Payment> allPayments = payments.findAll();

        List<CategoryCount> byCategory = categories.findAll().stream().map(c -> new CategoryCount(c.getShortName(),
                allBookings.stream().filter(b -> c.getId().equals(categoryOfTeacher.get(b.getTeacherId()))).count())).toList();

        List<TopTeacher> top = allTeachers.stream().filter(t -> "verified".equals(t.getStatus()))
                .map(t -> new TopTeacher(t.getId(), t.getName(), t.getSubject(), t.getRating(), t.getImage(), t.getImageFallback(),
                        paid.stream().filter(p -> p.getTeacherId().equals(t.getId())).mapToLong(Payment::getAmount).sum()))
                .sorted(Comparator.comparingLong(TopTeacher::earnings).reversed())
                .limit(5).toList();

        List<Review> allReviews = reviews.findAll();
        List<RatingCount> ratings = new ArrayList<>();
        for (int r = 5; r >= 1; r--) {
            final int rating = r;
            ratings.add(new RatingCount(r + "★", allReviews.stream().filter(x -> x.getRating() == rating).count()));
        }

        List<MethodCount> methods = allPayments.stream()
                .collect(Collectors.groupingBy(Payment::getMethod, LinkedHashMap::new, Collectors.counting()))
                .entrySet().stream().map(e -> new MethodCount(e.getKey(), e.getValue())).toList();

        return new ReportDto(byCategory, top, ratings, methods);
    }

    public AdminService(TeacherRepository teachers, LearnerRepository learners, BookingRepository bookings, PaymentRepository payments, ReviewRepository reviews, CategoryRepository categories, NotificationService notifications) {
        this.teachers = teachers;
        this.learners = learners;
        this.bookings = bookings;
        this.payments = payments;
        this.reviews = reviews;
        this.categories = categories;
        this.notifications = notifications;
    }
}
