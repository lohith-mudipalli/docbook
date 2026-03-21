package com.docbook.backend.service;

import com.docbook.backend.model.NotificationJob;
import com.docbook.backend.model.NotificationStatus;
import com.docbook.backend.repository.NotificationJobRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class NotificationService {
    private final NotificationJobRepository jobRepo;

    public NotificationService(NotificationJobRepository jobRepo) {
        this.jobRepo = jobRepo;
    }
    
    public void enqueueAppointmentBookedEmail(String toEmail, Long appointmentId, String startUtc, String endUtc) {
        String subject = "DocBook: Appointment Confirmed (#" + appointmentId + ")";
        String body = "Your Appointment is Confirmed.\n\n" +
                "Appointment Id: " + appointmentId + "\n" +
                "Start (UTC): " + startUtc + "\n" +
                "End (UTC): " + endUtc + "\n\n" +
                "Thank You, \n DocBook";

        jobRepo.save(new NotificationJob(
            "APPOINTMENT_BOOKED_EMAIL",
            toEmail,
            subject,
            body,
            NotificationStatus.PENDING,
            0,
            Instant.now(),
            Instant.now()
        ));
    }
}
