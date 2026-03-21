package com.docbook.backend.service;

import com.docbook.backend.model.NotificationJob;
import com.docbook.backend.model.NotificationStatus;
import com.docbook.backend.repository.NotificationJobRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.List;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
public class NotificationWorker {
    private final NotificationJobRepository jobRepo;
    private final EmailService emailService;
    
    public NotificationWorker(NotificationJobRepository jobRepo, EmailService emailService) {
        this.jobRepo = jobRepo;
        this.emailService = emailService;
    }

    //Runs for every 30 Seconds
    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void run() {
        Instant now = Instant.now();
        List <NotificationJob> jobs = jobRepo
                .findTop20ByStatusAndNextAttemptAtUtcLessThanEqualOrderByNextAttemptAtUtcAsc(NotificationStatus.PENDING, now);
        
         // For each NotificationJob in jobs
        for(NotificationJob job: jobs) {
            try {
                emailService.send(job.getToEmail(), job.getSubject(), job.getBody());
                job.setStatus(NotificationStatus.SENT);
            } catch(Exception e) {
                int nextAttempt = job.getAttempts() + 1;
                job.setAttempts(nextAttempt);

                // Backoff: 1m, 2m, 5m, 10m, then mark it is Failed after 5 tries
                if(nextAttempt >= 5) {
                    job.setStatus(NotificationStatus.FAILED);
                } else {
                    long minutes = switch (nextAttempt) {
                        case 1 -> 1;
                        case 2 -> 2;
                        case 3 -> 5;
                        default -> 10;
                    };
                    job.setNextAttemptAtUtc(Instant.now().plus(minutes, ChronoUnit.MINUTES));
                }
            }

        }

    }
}
