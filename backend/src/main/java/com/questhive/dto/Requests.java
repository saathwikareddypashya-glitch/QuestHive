package com.questhive.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.questhive.entity.AvailabilityRange;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

/** Request bodies accepted by the REST API. */
public final class Requests {
    private Requests() {}

    public record LoginRequest(@NotBlank(message = "Enter your email.") String email,
                               @NotBlank(message = "Enter your password.") String password,
                               @NotBlank String role) {}

    public record RegisterRequest(@NotBlank(message = "Enter your name.") String name,
                                  @Email(message = "Enter a valid email address.") @NotBlank String email,
                                  @NotBlank(message = "Enter a password.") @Size(min = 6, message = "Use at least 6 characters for your password.") String password,
                                  String gender) {}

    public record TeacherApplicationRequest(@NotBlank String name, String gender,
                                            @Email @NotBlank String email,
                                            @NotBlank(message = "Enter a password.") @Size(min = 6, message = "Use at least 6 characters for your password.") String password,
                                            String image,
                                            @NotBlank String subject, String category,
                                            @NotBlank @Size(min = 40, message = "Bio must be at least 40 characters.") String bio,
                                            @Min(0) int experienceYears, List<String> qualifications,
                                            String certificate, String certificateName,
                                            @Min(value = 200, message = "Price must be at least ₹200.") int price,
                                            @Min(15) int classDurationMins,
                                            @NotEmpty(message = "Add at least one time range.") List<AvailabilityRange> availability,
                                            String location) {}

    /** Partial update — null fields are left unchanged. */
    public record TeacherUpdateRequest(String name, String image, String imageFallback, String location, Boolean online,
                                       String description, String bio, Integer price, Integer experienceYears,
                                       String teachingStyle, Boolean firstClassFree, List<String> skills,
                                       List<String> qualifications) {}

    public record AvailabilityRequest(@NotNull List<AvailabilityRange> availability, Integer classDurationMins) {}

    public record LearnerUpdateRequest(String name, String email, String gender, String avatar, String location) {}

    public record BookingDraft(@NotBlank String teacherId, @NotBlank String date, @NotBlank String time,
                               int durationMins, int amount, @JsonProperty("isFree") boolean isFree) {}

    public record UserRef(@NotBlank String id, String name) {}

    public record PaymentRequest(@Valid @NotNull BookingDraft draft, @Valid @NotNull UserRef learner, String method) {}

    public record ReviewRequest(@NotBlank String bookingId,
                                @Min(value = 1, message = "Choose a star rating.") @Max(5) int rating,
                                @NotBlank @Size(min = 10, message = "Write at least 10 characters.") String comment,
                                @NotBlank String learnerId) {}

    public record ChangePasswordRequest(@NotBlank String role, @NotBlank String userId,
                                        @NotBlank(message = "Enter your current password.") String currentPassword,
                                        @NotBlank @Size(min = 6, message = "Use at least 6 characters for your new password.") String newPassword) {}

    public record ReadAllRequest(@NotBlank String role, @NotBlank String userId) {}

    public record RejectRequest(String reason) {}

    public record StatusRequest(@NotBlank String status) {}

    public record SubjectRequest(@NotBlank(message = "Enter a subject name.") String name) {}
}
