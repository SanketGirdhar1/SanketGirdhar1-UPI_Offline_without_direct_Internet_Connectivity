package com.demo.upimesh.controller;

import com.demo.upimesh.model.NodeProfile;
import com.demo.upimesh.model.NodeProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private NodeProfileRepository profileRepo;

    @GetMapping
    public ResponseEntity<NodeProfile> getProfile() {
        NodeProfile profile = profileRepo.findById("ADMIN").orElse(new NodeProfile("ADMIN", "Mesh Admin", null));
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<NodeProfile> updateProfile(@RequestBody Map<String, String> payload) {
        NodeProfile profile = profileRepo.findById("ADMIN").orElse(new NodeProfile("ADMIN", "Mesh Admin", null));
        
        if (payload.containsKey("name")) {
            profile.setName(payload.get("name"));
        }
        if (payload.containsKey("avatarBase64")) {
            profile.setAvatarBase64(payload.get("avatarBase64"));
        }
        
        NodeProfile saved = profileRepo.save(profile);
        return ResponseEntity.ok(saved);
    }
}
