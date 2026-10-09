package com.questhive.service;

import com.questhive.dto.Requests.PaymentRequest;
import com.questhive.entity.Booking;
import com.questhive.entity.Payment;
import com.questhive.entity.Teacher;
import com.questhive.exception.ApiException;
import com.questhive.repository.BookingRepository;
import com.questhive.repository.LearnerRepository;
import com.questhive.repository.PaymentRepository;
import com.questhive.repository.TeacherRepository;
import com.questhive.util.AppUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class BookingService {
    private static final Comparator<Booking> NEWEST_FIRST =
            Comparator.comparing((Booking b) -> b.getDate() + b.getTime()).reversed();

    private final BookingRepository bookings;
    private final PaymentRepository payments;
    private final TeacherRepository teachers;
    private final LearnerRepository learners;
    private final NotificationService notifications;

    public BookingService(BookingRepository bookings, PaymentRepository payments, TeacherRepository teachers,
                          LearnerRepository learners, NotificationService notifications) {
        this.bookings = bookings;
        this.payments = payments;
        this.teachers = teachers;
        this.learners = learners;
        this.notifications = notifications;
    }

    public List<Booking> forLearner(String learnerId) {
        return bookings.findByLearnerId(learnerId).stream().sorted(NEWEST_FIRST).toList();
    }

    public List<Booking> forTeacher(String teacherId) {
        return bookings.findByTeacherId(teacherId).stream().sorted(NEWEST_FIRST).toList();
    }

    public List<Booking> all() {
        return bookings.findAll().stream().sorted(NEWEST_FIRST).toList();
    }

    public Booking get(String id) {
        return bookings.findById(id).orElseThrow(() -> ApiException.notFound("booking"));
    }

    public boolean isFirstClass(String learnerId, String teacherId) {
        return !bookings.existsByLearnerIdAndTeacherIdAndStatusNot(learnerId, teacherId, "cancelled");
    }

    /** Simulated payment: creates the booking + payment record. Fails if the slot was taken meanwhile. */
    @Transactional
    public Booking payAndBook(PaymentRequest req) {
        var d = req.draft();
        if (bookings.existsByTeacherIdAndDateAndTimeAndStatus(d.teacherId(), d.date(), d.time(), "upcoming"))
            throw ApiException.conflict("That time slot is no longer available.");
        if (AppUtils.isPast(d.date(), d.time()))
            throw ApiException.badRequest("That time has already passed. Please choose another slot.");
        Teacher t = teachers.findById(d.teacherId()).orElseThrow(() -> ApiException.notFound("teacher"));
        var learner = learners.findById(req.learner().id()).orElseThrow(() -> ApiException.notFound("learner account"));
        String now = AppUtils.nowIso();

        if (!bookings.existsByTeacherIdAndLearnerId(t.getId(), learner.getId())) t.setStudentCount(t.getStudentCount() + 1);

        Booking b = new Booking();
        b.setId(AppUtils.uid("B"));
        b.setTeacherId(t.getId());
        b.setTeacherName(t.getName());
        b.setLearnerId(learner.getId());
        b.setLearnerName(learner.getName());
        b.setSubject(t.getSubject());
        b.setDate(d.date());
        b.setTime(d.time());
        b.setDurationMins(d.durationMins() > 0 ? d.durationMins() : t.getClassDurationMins());
        b.setFree(d.isFree());
        b.setAmount(d.isFree() ? 0 : t.getPrice());
        b.setStatus("upcoming");
        b.setPaymentMethod(d.isFree() ? "Free first class" : req.method());
        b.setReviewed(false);
        b.setCreatedAt(now);
        bookings.save(b);

        if (b.getAmount() > 0) {
            Payment p = new Payment();
            p.setId(AppUtils.uid("PAY"));
            p.setBookingId(b.getId());
            p.setLearnerId(learner.getId());
            p.setLearnerName(learner.getName());
            p.setTeacherId(t.getId());
            p.setTeacherName(t.getName());
            p.setSubject(t.getSubject());
            p.setAmount(b.getAmount());
            p.setMethod(req.method());
            p.setDate(now);
            p.setStatus("Pending");
            payments.save(p);
        }

        String when = AppUtils.dayOf(b.getDate()) + " at " + AppUtils.formatTime(b.getTime());
        notifications.notify("learner", learner.getId(), "booking", "Your booking with " + t.getName() + " is confirmed for " + when + ".", "/learner/bookings");
        notifications.notify("teacher", t.getId(), "booking", AppUtils.firstName(learner.getName()) + " booked a " + t.getSubject() + " class on " + when + ".", "/teacher/bookings");
        notifications.notify("admin", "admin", "payment", "New booking: " + AppUtils.firstName(learner.getName()) + " with " + t.getName()
                + (b.getAmount() > 0 ? " (₹" + b.getAmount() + ")." : " (free class)."), "/admin/bookings");
        return b;
    }

    @Transactional
    public Booking cancel(String id) {
        Booking b = get(id);
        if (!"upcoming".equals(b.getStatus())) throw ApiException.badRequest("Only upcoming classes can be cancelled.");
        b.setStatus("cancelled");
        payments.findFirstByBookingId(id).ifPresent(p -> p.setStatus("Refunded"));
        notifications.notify("teacher", b.getTeacherId(), "booking",
                AppUtils.firstName(b.getLearnerName()) + " cancelled the " + b.getSubject() + " class on " + b.getDate() + ".", "/teacher/bookings");
        return b;
    }

    @Transactional
    public Booking complete(String id) {
        Booking b = get(id);
        if (!"upcoming".equals(b.getStatus())) throw ApiException.badRequest("Only upcoming classes can be completed.");
        b.setStatus("completed");
        payments.findFirstByBookingId(id).ifPresent(p -> p.setStatus("Completed"));
        teachers.findById(b.getTeacherId()).ifPresent(t -> t.setCompletedClasses(t.getCompletedClasses() + 1));
        notifications.notify("learner", b.getLearnerId(), "review",
                "How was your " + b.getSubject() + " class with " + b.getTeacherName() + "? Leave a review.", "/learner/reviews");
        return b;
    }

    public List<Payment> paymentsForLearner(String learnerId) {
        return payments.findByLearnerId(learnerId).stream().sorted(Comparator.comparing(Payment::getDate).reversed()).toList();
    }

    public List<Payment> paymentsForTeacher(String teacherId) {
        return payments.findByTeacherId(teacherId).stream().sorted(Comparator.comparing(Payment::getDate).reversed()).toList();
    }

    public List<Payment> allPayments() {
        return payments.findAll().stream().sorted(Comparator.comparing(Payment::getDate).reversed()).toList();
    }
}
