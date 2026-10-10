package com.example.contacts.common;

import com.example.contacts.contact.ContactType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class FreelanceRequiresVatValidator implements ConstraintValidator<FreelanceRequiresVat, VatHolder> {

    @Override
    public boolean isValid(VatHolder value, ConstraintValidatorContext context) {
        if (value == null || value.type() != ContactType.FREELANCE) {
            return true;
        }
        String vat = value.vatNumber();
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
