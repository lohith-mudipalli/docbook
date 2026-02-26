package com.docbook.backend.service;

import com.docbook.backend.dto.LoginRequest;
import com.docbook.backend.dto.RegisterRequest;
import com.docbook.backend.model.Role;
import com.docbook.backend.model.User;
import com.docbook.backend.repository.UserRepository;
import com.docbook.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public void register(RegisterRequest req) {
        String email = req.email.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        String hash = passwordEncoder.encode(req.password);
        User user = new User(email, hash, Role.PATIENT);

        userRepository.save(user);
    }

    public String login(LoginRequest req) {
        String email = req.email.trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        boolean ok = passwordEncoder.matches(req.password, user.getPasswordHash());
        if (!ok) {
            throw new RuntimeException("Invalid email or password");
        }

        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }
}