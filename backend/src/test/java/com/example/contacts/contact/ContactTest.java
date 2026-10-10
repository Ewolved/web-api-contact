package com.example.contacts.contact;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.contacts.company.Company;
import org.junit.jupiter.api.Test;

class ContactTest {

    @Test
    void freelanceWithoutVatIsRejected() {
        assertThatThrownBy(() -> new Contact("Eva", "Janssens", "1 rue X", ContactType.FREELANCE, " "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void updateCannotTurnEmployeeIntoFreelanceWithoutVat() {
        Contact contact = new Contact("Eva", "Janssens", "1 rue X", ContactType.EMPLOYEE, null);

        assertThatThrownBy(() -> contact.update("Eva", "Janssens", "1 rue X", ContactType.FREELANCE, null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(contact.getType()).isEqualTo(ContactType.EMPLOYEE);
    }

    @Test
    void joinCompanyLinksBothSidesOnce() {
        Contact contact = new Contact("Eva", "Janssens", "1 rue X", ContactType.EMPLOYEE, null);
        Company company = new Company("Acme", "1 rue Y", "BE01");

        contact.joinCompany(company);
        contact.joinCompany(company);

        assertThat(contact.getCompanies()).containsExactly(company);
        assertThat(company.getContacts()).containsExactly(contact);
    }

    @Test
    void leaveAllCompaniesUnlinksBothSides() {
        Contact contact = new Contact("Eva", "Janssens", "1 rue X", ContactType.EMPLOYEE, null);
        Company acme = new Company("Acme", "1 rue Y", "BE01");
        Company globex = new Company("Globex", "2 rue Y", "BE02");
        contact.joinCompany(acme);
        contact.joinCompany(globex);

        contact.leaveAllCompanies();

        assertThat(contact.getCompanies()).isEmpty();
        assertThat(acme.getContacts()).isEmpty();
        assertThat(globex.getContacts()).isEmpty();
    }

    @Test
    void companiesCannotBeModifiedFromOutside() {
        Contact contact = new Contact("Eva", "Janssens", "1 rue X", ContactType.EMPLOYEE, null);

        assertThatThrownBy(() -> contact.getCompanies().add(new Company("Acme", "1 rue Y", "BE01")))
                .isInstanceOf(UnsupportedOperationException.class);
    }
}
