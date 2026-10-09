package com.questhive.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** One weekly block of teaching hours, e.g. Monday 17:00–20:00. */
@Embeddable
public class AvailabilityRange {
    @Column(name = "range_id")
    private String id;

    @Column(name = "day_of_week")
    private String day;

    @Column(name = "start_time")
    private String start;

    @Column(name = "end_time")
    private String end;

    public AvailabilityRange() {}
    public AvailabilityRange(String id, String day, String start, String end) {
        this.id = id;
        this.day = day;
        this.start = start;
        this.end = end;
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }
    public String getStart() { return start; }
    public void setStart(String start) { this.start = start; }
    public String getEnd() { return end; }
    public void setEnd(String end) { this.end = end; }
}
