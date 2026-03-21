package com.docbook.backend.repository;

import com.docbook.backend.model.NotificationJob;
import com.docbook.backend.model.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface NotificationJobRepository extends JpaRepository<NotificationJob, Long> {
    List<NotificationJob> findTop20ByStatusAndNextAttemptAtUtcLessThanEqualOrderByNextAttemptAtUtcAsc(
        NotificationStatus status, Instant now
    );
}
