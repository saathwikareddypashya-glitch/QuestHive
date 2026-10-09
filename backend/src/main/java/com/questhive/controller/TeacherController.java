package com.questhive.controller;

import com.questhive.dto.Requests.*;
import com.questhive.dto.Responses.SlotDto;
import com.questhive.entity.Booking;
import com.questhive.entity.Payment;
import com.questhive.entity.Review;
import com.questhive.entity.Teacher;
import com.questhive.service.BookingService;
import com.questhive.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {
    private final TeacherService teachers;
    private final BookingService bookings;

    /** Public teachers; ?include=all also returns pending/rejected applications. */
    @GetMapping
    public List<Teacher> list(@RequestParam(required = false) String include) {
        return "all".equals(include) ? teachers.getAll() : teachers.getPublic();
    }

    @GetMapping("/{id}")
    public Teacher get(@PathVariable String id) {
        return teachers.get(id);
    }

    @GetMapping("/{id}/reviews")
    public List<Review> reviews(@PathVariable String id) {
        return teachers.getReviews(id);
    }

    @GetMapping("/{id}/slots")
    public List<SlotDto> slots(@PathVariable String id, @RequestParam String date) {
        return teachers.getSlots(id, date);
    }

    @GetMapping("/{id}/bookings")
    public List<Booking> bookings(@PathVariable String id) {
        return bookings.forTeacher(id);
    }

    @GetMapping("/{id}/transactions")
    public List<Payment> transactions(@PathVariable String id) {
        return bookings.paymentsForTeacher(id);
    }

    @PatchMapping("/{id}")
    public Teacher update(@PathVariable String id, @RequestBody TeacherUpdateRequest req) {
        return teachers.updateProfile(id, req);
    }

    @PutMapping("/{id}/availability")
    public Teacher availability(@PathVariable String id, @Valid @RequestBody AvailabilityRequest req) {
        return teachers.updateAvailability(id, req);
    }

    @PostMapping("/apply")
    @ResponseStatus(HttpStatus.CREATED)
    public Teacher apply(@Valid @RequestBody TeacherApplicationRequest req) {
        return teachers.apply(req);
    }

    public TeacherController(TeacherService teachers, BookingService bookings) {
        this.teachers = teachers;
        this.bookings = bookings;
    }
}
