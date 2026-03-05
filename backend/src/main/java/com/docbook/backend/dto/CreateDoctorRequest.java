package com.docbook.backend.dto;

import jakarta.validation.constraints.NotBlank; 

public class CreateDoctorRequest {
    @NotBlank public String displayName;
    @NotBlank public String specialization;
    @NotBlank public String userEmail; //admin uses this to link doctor to exisiting user.    
}
