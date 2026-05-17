package com.demo.upimesh.config;

import com.demo.upimesh.model.NodeProfile;
import com.demo.upimesh.model.NodeProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the default profile on every startup so profile data always exists.
 */
@Component
public class DataInitializer implements ApplicationRunner {

    @Autowired
    private NodeProfileRepository profileRepo;

    @Override
    public void run(ApplicationArguments args) {
        profileRepo.findById("ADMIN").orElseGet(() -> {
            NodeProfile defaultProfile = new NodeProfile("ADMIN", "Mesh Admin", null);
            return profileRepo.save(defaultProfile);
        });
    }
}
