package com.example.contacts.contact.dto;

import com.example.contacts.contact.ContactType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@FreelanceRequiresVat
public record ContactRequest(
        @NotBlank @Size(max = 255) String firstName,
        @NotBlank @Size(max = 255) String lastName,
        @NotBlank @Size(max = 255) String address,
        @NotNull ContactType type,
        @Size(max = 255) String vatNumber) {

    public ContactRequest {
        vatNumber = vatNumber == null ? null : vatNumber.strip();
    }
}
