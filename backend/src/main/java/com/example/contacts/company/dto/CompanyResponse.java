package com.example.contacts.company.dto;

import com.example.contacts.company.Company;
import com.example.contacts.contact.Contact;
import java.util.Comparator;
import java.util.List;

public record CompanyResponse(
        Long id,
        String name,
        String address,
        String vatNumber,
        List<ContactSummary> contacts) {

    public record ContactSummary(Long id, String firstName, String lastName) {
    }

    public static CompanyResponse from(Company c) {
        List<ContactSummary> contacts = c.getContacts().stream()
                .sorted(Comparator.comparing(Contact::getId))
                .map(co -> new ContactSummary(co.getId(), co.getFirstName(), co.getLastName()))
                .toList();
        return new CompanyResponse(c.getId(), c.getName(), c.getAddress(), c.getVatNumber(), contacts);
    }
}
