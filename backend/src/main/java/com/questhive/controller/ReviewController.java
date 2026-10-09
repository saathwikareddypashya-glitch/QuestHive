package com.questhive.controller;

import com.questhive.dto.Requests.ReviewRequest;
import com.questhive.entity.Review;
import com.questhive.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviews;

    @GetMapping
    public List<Review> all() {
        return reviews.all();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Review submit(@Valid @RequestBody ReviewRequest req) {
        return reviews.submit(req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable String id) {
        reviews.remove(id);
    }

    public ReviewController(ReviewService reviews) {
        this.reviews = reviews;
    }
}
