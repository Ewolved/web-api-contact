package com.example.contacts.contact;

import com.example.contacts.company.Company;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "contact")
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactType type;

    private String vatNumber;

    /** Owning side of the contact/company association. */
    @ManyToMany
    @JoinTable(name = "contact_company",
            joinColumns = @JoinColumn(name = "contact_id"),
            inverseJoinColumns = @JoinColumn(name = "company_id"))
    private Set<Company> companies = new HashSet<>();

    protected Contact() {
        // required by JPA
    }

    public Contact(String firstName, String lastName, String address, ContactType type, String vatNumber) {
        assign(firstName, lastName, address, type, vatNumber);
    }

    public void update(String firstName, String lastName, String address, ContactType type, String vatNumber) {
        assign(firstName, lastName, address, type, vatNumber);
    }

    /** Links this contact to the company on both sides of the association; does nothing if already linked. */
    public void joinCompany(Company company) {
        Objects.requireNonNull(company, "company");
        if (companies.add(company)) {
            company.linkContact(this);
        }
    }

    /** Unlinks this contact from all its companies, typically before deleting it. */
    public void leaveAllCompanies() {
        for (Company company : List.copyOf(companies)) {
            companies.remove(company);
            company.unlinkContact(this);
        }
    }

    private void assign(String firstName, String lastName, String address, ContactType type, String vatNumber) {
        Objects.requireNonNull(type, "type");
        if (type.requiresVatNumber() && (vatNumber == null || vatNumber.isBlank())) {
            throw new IllegalArgumentException("A " + type + " contact requires a VAT number");
        }
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.type = type;
        this.vatNumber = vatNumber;
    }

    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getAddress() { return address; }
    public ContactType getType() { return type; }
    public String getVatNumber() { return vatNumber; }
    public Set<Company> getCompanies() { return Collections.unmodifiableSet(companies); }
}
