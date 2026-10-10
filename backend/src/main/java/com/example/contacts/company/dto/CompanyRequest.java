package com.example.contacts.company.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @Size(max = 255) String name,
        @NotBlank @Size(max = 255) String address,
        @NotBlank @Size(max = 255) String vatNumber) {

    public CompanyRequest {
        vatNumber = vatNumber == null ? null : vatNumber.strip();
    }
}
