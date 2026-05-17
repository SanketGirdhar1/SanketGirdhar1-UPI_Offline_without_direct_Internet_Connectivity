package com.demo.upimesh.model;

import jakarta.persistence.*;

@Entity
@Table(name = "node_profiles")
public class NodeProfile {

    @Id
    private String id; // E.g., "ADMIN"

    @Column(nullable = false)
    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String avatarBase64;

    public NodeProfile() {}

    public NodeProfile(String id, String name, String avatarBase64) {
        this.id = id;
        this.name = name;
        this.avatarBase64 = avatarBase64;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAvatarBase64() { return avatarBase64; }
    public void setAvatarBase64(String avatarBase64) { this.avatarBase64 = avatarBase64; }
}
