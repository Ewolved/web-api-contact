package com.example.contacts.contact.dto;

import com.example.contacts.common.FreelanceRequiresVat;
import com.example.contacts.common.VatHolder;
import com.example.contacts.contact.ContactType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@FreelanceRequiresVat
public record ContactRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String address,
        @NotNull ContactType type,
        String vatNumber) implements VatHolder {
}
