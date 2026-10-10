package com.example.contacts.common;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = FreelanceRequiresVatValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface FreelanceRequiresVat {
    String message() default "Un freelance doit avoir un numéro de TVA";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
