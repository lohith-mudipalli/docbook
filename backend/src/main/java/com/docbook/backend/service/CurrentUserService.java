package com.docbook.backend.service;

import com.docbook.backend.model.User;
import com.docbook.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    
    private final UserRepository userRepo;

    public CurrentUserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public User get() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = principal.toString().trim().toLowerCase();
        return userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("Current User not found"));
    }

}
