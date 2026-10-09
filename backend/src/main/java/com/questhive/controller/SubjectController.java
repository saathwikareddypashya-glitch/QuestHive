package com.questhive.controller;

import com.questhive.dto.Requests.SubjectRequest;
import com.questhive.entity.Category;
import com.questhive.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final AdminService admin;

    @GetMapping
    public List<Category> categories() {
        return admin.categories();
    }

    @PostMapping("/{categoryId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Category add(@PathVariable String categoryId, @Valid @RequestBody SubjectRequest req) {
        return admin.addSubject(categoryId, req.name());
    }

    /** Subject name goes in the query string because names like "UI/UX Design" contain a slash. */
    @DeleteMapping("/{categoryId}")
    public Category remove(@PathVariable String categoryId, @RequestParam String name) {
        return admin.removeSubject(categoryId, name);
    }

    public SubjectController(AdminService admin) {
        this.admin = admin;
    }
}
