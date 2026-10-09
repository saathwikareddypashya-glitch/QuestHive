package com.questhive.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    private String id;
    private String name;
    private String shortName;
    private String emoji;
    private String description;

    @ElementCollection
    @CollectionTable(name = "category_subjects", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "subject_name")
    @Fetch(FetchMode.SUBSELECT)
    private List<String> subjects = new ArrayList<>();

    public Category() {}
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getShortName() { return shortName; }
    public void setShortName(String shortName) { this.shortName = shortName; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getSubjects() { return subjects; }
    public void setSubjects(List<String> subjects) { this.subjects = subjects; }
}
