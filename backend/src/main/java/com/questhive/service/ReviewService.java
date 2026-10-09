package com.questhive.service;

import com.questhive.dto.Requests.ReviewRequest;
import com.questhive.entity.Booking;
import com.questhive.entity.Learner;
import com.questhive.entity.Review;
import com.questhive.exception.ApiException;
import com.questhive.repository.BookingRepository;
import com.questhive.repository.LearnerRepository;
import com.questhive.repository.ReviewRepository;
import com.questhive.repository.TeacherRepository;
import com.questhive.util.AppUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviews;
    private final BookingRepository bookings;
    private final TeacherRepository teachers;
    private final LearnerRepository learners;
    private final NotificationService notifications;

    public List<Review> all() {
        return reviews.findAll().stream().sorted(Comparator.comparing(Review::getDate).reversed()).toList();
    }

    public List<Review> forLearner(String learnerId) {
        return reviews.findByLearnerId(learnerId).stream().sorted(Comparator.comparing(Review::getDate).reversed()).toList();
    }

    /** Only the learner of a completed, not-yet-reviewed class can review it. Updates the teacher's rating. */
    @Transactional
    public Review submit(ReviewRequest req) {
        Booking b = bookings.findById(req.bookingId()).orElseThrow(() -> ApiException.notFound("class"));
        if (!b.getLearnerId().equals(req.learnerId())) throw ApiException.badRequest("You can only review your own classes.");
        if (!"completed".equals(b.getStatus())) throw ApiException.badRequest("You can review a class after it is completed.");
        if (b.isReviewed()) throw ApiException.conflict("You have already reviewed this class.");
        Learner l = learners.findById(req.learnerId()).orElseThrow(() -> ApiException.notFound("learner account"));

        Review r = new Review();
        r.setId(AppUtils.uid("R"));
        r.setTeacherId(b.getTeacherId());
        r.setLearnerId(l.getId());
        r.setLearnerName(AppUtils.firstName(l.getName()));
        r.setRating(req.rating());
        r.setComment(req.comment().trim());
        r.setDate(AppUtils.today());
        r.setBookingId(b.getId());
        reviews.save(r);
        b.setReviewed(true);

        teachers.findById(b.getTeacherId()).ifPresent(t -> {
            double avg = (t.getRating() * t.getReviewCount() + req.rating()) / (t.getReviewCount() + 1);
            t.setRating(Math.round(avg * 10) / 10.0);
            t.setReviewCount(t.getReviewCount() + 1);
            notifications.notify("teacher", t.getId(), "review",
                    "You received a new " + req.rating() + "★ review from " + r.getLearnerName() + ".", "/teacher/reviews");
        });
        return r;
    }

    /** Admin moderation — removes a review and recalculates the teacher's rating. */
    @Transactional
    public void remove(String id) {
        Review r = reviews.findById(id).orElseThrow(() -> ApiException.notFound("review"));
        teachers.findById(r.getTeacherId()).ifPresent(t -> {
            if (t.getReviewCount() > 1) {
                double avg = (t.getRating() * t.getReviewCount() - r.getRating()) / (t.getReviewCount() - 1);
                t.setRating(Math.round(avg * 10) / 10.0);
                t.setReviewCount(t.getReviewCount() - 1);
            }
        });
        if (r.getBookingId() != null) bookings.findById(r.getBookingId()).ifPresent(b -> b.setReviewed(false));
        reviews.delete(r);
    }

    public ReviewService(ReviewRepository reviews, BookingRepository bookings, TeacherRepository teachers, LearnerRepository learners, NotificationService notifications) {
        this.reviews = reviews;
        this.bookings = bookings;
        this.teachers = teachers;
        this.learners = learners;
        this.notifications = notifications;
    }
}
