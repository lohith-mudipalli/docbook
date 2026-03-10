package com.docbook.backend.controller;

import com.docbook.backend.dto.BookAppointmentRequest;
import com.docbook.backend.model.Appointment;
import com.docbook.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController 
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    private final BookingService bookingService;

    public AppointmentController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/book")
    public ResponseEntity<?> book(@Valid @RequestBody BookAppointmentRequest req) {
        Appointment appt = bookingService.book(req.timeslotId);
        return ResponseEntity.ok(Map.of(
            "appointmentId", appt.getId(),
            "status", appt.getStatus().name()
        ));
    }

    @GetMapping("/me")
    public List<Appointment> myAppointments() {
        return bookingService.myAppointments();
    }

    @PostMapping("/{appointmentId}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long appointmentId) {
        bookingService.cancel(appointmentId);
        return ResponseEntity.ok(Map.of("message", "cancelled"));
    }

}
