package com.docbook.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AvailabilityRequest {
    @Min(1) @Max(7) public int dayOfWeek; //1=Mon, 2=Tue, ...7 = sun
    @NotBlank public String startLocal; // 9:00
    @NotBlank public String endLocal; //17:00
    @NotNull public Integer slotMinutes; //15/30
    
}
