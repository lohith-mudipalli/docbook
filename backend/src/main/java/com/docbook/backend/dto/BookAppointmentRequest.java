package com.docbook.backend.dto;

import jakarta.validation.constraints.NotNull;

public class BookAppointmentRequest {
    @NotNull public Long timeslotId;
}
