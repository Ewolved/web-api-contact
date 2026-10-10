package com.example.contacts.contact.dto;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Reports a missing VAT number on the {@code vatNumber} field so that clients can display it next to the input.
 * The rule itself is owned by {@link com.example.contacts.contact.ContactType#requiresVatNumber()}.
 */
public class FreelanceRequiresVatValidator implements ConstraintValidator<FreelanceRequiresVat, ContactRequest> {

    @Override
    public boolean isValid(ContactRequest request, ConstraintValidatorContext context) {
        if (request == null || request.type() == null || !request.type().requiresVatNumber()) {
            return true;
        }
        String vat = request.vatNumber();
        if (vat != null && !vat.isBlank()) {
            return true;
        }
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                .addPropertyNode("vatNumber")
                .addConstraintViolation();
        return false;
    }
}
