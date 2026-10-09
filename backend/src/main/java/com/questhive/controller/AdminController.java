package com.questhive.controller;

import com.questhive.config.DataSeeder;
import com.questhive.dto.Requests.RejectRequest;
import com.questhive.dto.Requests.StatusRequest;
import com.questhive.dto.Responses.LearnerSummary;
import com.questhive.dto.Responses.ReportDto;
import com.questhive.dto.Responses.StatsDto;
import com.questhive.entity.Teacher;
import com.questhive.service.AdminService;
import com.questhive.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AdminService admin;
    private final TeacherService teachers;
    private final DataSeeder seeder;

    @GetMapping("/stats")
    public StatsDto stats() {
        return admin.stats();
    }

    @GetMapping("/teachers")
    public List<Teacher> teachers() {
        return teachers.getAll();
    }

    @GetMapping("/applications")
    public List<Teacher> applications() {
        return admin.applications();
    }

    @PostMapping("/teachers/{id}/approve")
    public Teacher approve(@PathVariable String id) {
        return admin.approve(id);
    }

    @PostMapping("/teachers/{id}/reject")
    public Teacher reject(@PathVariable String id, @RequestBody(required = false) RejectRequest req) {
        return admin.reject(id, req == null ? null : req.reason());
    }

    @PatchMapping("/teachers/{id}/status")
    public Teacher status(@PathVariable String id, @Valid @RequestBody StatusRequest req) {
        return admin.setStatus(id, req.status());
    }

    @GetMapping("/learners")
    public List<LearnerSummary> learners() {
        return admin.learnerSummaries();
    }

    @GetMapping("/reports")
    public ReportDto reports() {
        return admin.report();
    }

    /** Restores the original demo data. */
    @PostMapping("/reset")
    public Map<String, Boolean> reset() throws Exception {
        seeder.reset();
        return Map.of("ok", true);
    }

    public AdminController(AdminService admin, TeacherService teachers, DataSeeder seeder) {
        this.admin = admin;
        this.teachers = teachers;
        this.seeder = seeder;
    }
}
