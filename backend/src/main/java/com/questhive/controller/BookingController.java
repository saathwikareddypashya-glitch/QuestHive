package com.questhive.controller;

import com.questhive.dto.Requests.PaymentRequest;
import com.questhive.dto.Responses.FirstClassDto;
import com.questhive.entity.Booking;
import com.questhive.entity.Payment;
import com.questhive.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {
    private final BookingService bookings;

    @GetMapping("/bookings")
    public List<Booking> all() {
        return bookings.all();
    }

    @GetMapping("/bookings/first-class")
    public FirstClassDto firstClass(@RequestParam String learner, @RequestParam String teacher) {
        return new FirstClassDto(bookings.isFirstClass(learner, teacher));
    }

    @GetMapping("/bookings/{id}")
    public Booking get(@PathVariable String id) {
        return bookings.get(id);
    }

    @PostMapping("/bookings/{id}/cancel")
    public Booking cancel(@PathVariable String id) {
        return bookings.cancel(id);
    }

    @PostMapping("/bookings/{id}/complete")
    public Booking complete(@PathVariable String id) {
        return bookings.complete(id);
    }

    /** Simulated payment — no real gateway. Creates the booking and its payment record. */
    @PostMapping("/payments")
    @ResponseStatus(HttpStatus.CREATED)
    public Booking pay(@Valid @RequestBody PaymentRequest req) {
        return bookings.payAndBook(req);
    }

    @GetMapping("/payments")
    public List<Payment> payments() {
        return bookings.allPayments();
    }

    public BookingController(BookingService bookings) {
        this.bookings = bookings;
    }
}
