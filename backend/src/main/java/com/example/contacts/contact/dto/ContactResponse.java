package com.example.contacts.contact.dto;

import com.example.contacts.company.Company;
import com.example.contacts.contact.Contact;
import com.example.contacts.contact.ContactType;
import java.util.Comparator;
import java.util.List;

public record ContactResponse(
        Long id,
        String firstName,
        String lastName,
        String address,
        ContactType type,
        String vatNumber,
        List<CompanySummary> companies) {

    public record CompanySummary(Long id, String name, String vatNumber) {
    }

    public static ContactResponse from(Contact c) {
        List<CompanySummary> companies = c.getCompanies().stream()
                .sorted(Comparator.comparing(Company::getId))
                .map(co -> new CompanySummary(co.getId(), co.getName(), co.getVatNumber()))
                .toList();
        return new ContactResponse(c.getId(), c.getFirstName(), c.getLastName(), c.getAddress(),
                c.getType(), c.getVatNumber(), companies);
    }
}
