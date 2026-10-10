package com.example.contacts.contact;

public enum ContactType {
    EMPLOYEE(false),
    FREELANCE(true);

    private final boolean vatNumberRequired;

    ContactType(boolean vatNumberRequired) {
        this.vatNumberRequired = vatNumberRequired;
    }

    public boolean requiresVatNumber() {
        return vatNumberRequired;
    }
}
