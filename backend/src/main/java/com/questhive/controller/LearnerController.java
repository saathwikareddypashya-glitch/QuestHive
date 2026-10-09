package com.questhive.controller;

import com.questhive.dto.Requests.LearnerUpdateRequest;
import com.questhive.dto.Responses.LearnerSummary;
import com.questhive.entity.Booking;
import com.questhive.entity.Learner;
import com.questhive.entity.Payment;
import com.questhive.entity.Review;
import com.questhive.service.AdminService;
import com.questhive.service.AuthService;
import com.questhive.service.BookingService;
import com.questhive.service.ReviewService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learners")
public class LearnerController {
    private final AuthService auth;
    private final BookingService bookings;
    private final ReviewService reviews;
    private final AdminService admin;

    @GetMapping
    public List<LearnerSummary> list() {
        return admin.learnerSummaries();
    }

    @GetMapping("/{id}")
    public Learner get(@PathVariable String id) {
        return auth.getLearner(id);
    }

    @PatchMapping("/{id}")
    public Learner update(@PathVariable String id, @RequestBody LearnerUpdateRequest req) {
        return auth.updateLearner(id, req);
    }

    @GetMapping("/{id}/bookings")
    public List<Booking> bookings(@PathVariable String id) {
        return bookings.forLearner(id);
    }

    @GetMapping("/{id}/payments")
    public List<Payment> payments(@PathVariable String id) {
        return bookings.paymentsForLearner(id);
    }

    @GetMapping("/{id}/reviews")
    public List<Review> reviews(@PathVariable String id) {
        return reviews.forLearner(id);
    }

    public LearnerController(AuthService auth, BookingService bookings, ReviewService reviews, AdminService admin) {
        this.auth = auth;
        this.bookings = bookings;
        this.reviews = reviews;
        this.admin = admin;
    }
}
