package com.questhive.dto;

import java.util.List;

/** Response shapes that aren't plain entities. */
public final class Responses {
    private Responses() {}

    public record UserDto(String id, String role, String name, String email, String avatar) {}

    public record SlotDto(String time, boolean available, String reason) {}

    public record FirstClassDto(boolean firstClass) {}

    public record MonthPoint(String month, long bookings, long revenue, long gmv) {}

    public record StatsDto(long learners, long teachers, long pending, long bookings, long gmv, long revenue, List<MonthPoint> series) {}

    public record LearnerSummary(String id, String name, String email, String gender, String avatar, double rating,
                                 String ratingNote, String joinedAt, String location, long bookings, long spent) {}

    public record CategoryCount(String name, long bookings) {}
    public record TopTeacher(String id, String name, String subject, double rating, String image, String imageFallback, long earnings) {}
    public record RatingCount(String rating, long count) {}
    public record MethodCount(String method, long count) {}
    public record ReportDto(List<CategoryCount> byCategory, List<TopTeacher> topTeachers, List<RatingCount> ratings, List<MethodCount> methods) {}
}
