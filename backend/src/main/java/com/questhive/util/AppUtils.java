package com.questhive.util;

import com.questhive.entity.AvailabilityRange;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

public final class AppUtils {
    private AppUtils() {}

    private static final Random RANDOM = new Random();
    private static final DateTimeFormatter TIME_12H = DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH);

    /** Short unique id like "B_k3j9x2a". */
    public static String uid(String prefix) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder(prefix).append('_');
        for (int i = 0; i < 9; i++) sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        return sb.toString();
    }

    public static String today() { return LocalDate.now().toString(); }

    public static String nowIso() { return Instant.now().toString(); }

    /** "2026-10-10" → "Saturday" */
    public static String dayOf(String isoDate) {
        return LocalDate.parse(isoDate).getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
    }

    /** "17:00" → "5:00 PM" */
    public static String formatTime(String time) {
        return LocalTime.parse(time).format(TIME_12H);
    }

    public static boolean isPast(String date, String time) {
        return LocalDateTime.of(LocalDate.parse(date), LocalTime.parse(time)).isBefore(LocalDateTime.now());
    }

    private static int toMinutes(String t) {
        LocalTime lt = LocalTime.parse(t);
        return lt.getHour() * 60 + lt.getMinute();
    }

    private static String fromMinutes(int m) {
        return String.format("%02d:%02d", m / 60, m % 60);
    }

    /** Bookable slot start times for one weekday, generated from weekly availability ranges. */
    public static List<String> generateSlots(List<AvailabilityRange> ranges, String day, int durationMins) {
        TreeSet<String> slots = new TreeSet<>();
        for (AvailabilityRange r : ranges) {
            if (!r.getDay().equals(day)) continue;
            int end = toMinutes(r.getEnd());
            for (int t = toMinutes(r.getStart()); t + durationMins <= end; t += durationMins) slots.add(fromMinutes(t));
        }
        return new ArrayList<>(slots);
    }

    public static String firstName(String name) {
        return name == null ? "" : name.split(" ")[0];
    }

    /** "2026-10-05T10:00:00Z" or "2026-10-05" → "2026-10" */
    public static String monthKey(String iso) {
        return iso == null || iso.length() < 7 ? "" : iso.substring(0, 7);
    }
}
