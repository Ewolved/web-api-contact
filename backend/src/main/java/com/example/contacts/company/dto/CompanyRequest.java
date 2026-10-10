package com.example.contacts.company.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyRequest(
        String name,
        @NotBlank String address,
        @NotBlank String vatNumber) {
}
