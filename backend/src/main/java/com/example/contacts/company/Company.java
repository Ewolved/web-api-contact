package com.example.contacts.company;

import com.example.contacts.contact.Contact;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "company")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, unique = true)
    private String vatNumber;

    /** Inverse side of the association, owned by {@link Contact#joinCompany(Company)}. */
    @ManyToMany(mappedBy = "companies")
    private Set<Contact> contacts = new HashSet<>();

    protected Company() {
        // required by JPA
    }

    public Company(String name, String address, String vatNumber) {
        update(name, address, vatNumber);
    }

    public void update(String name, String address, String vatNumber) {
        this.name = name;
        this.address = address;
        this.vatNumber = vatNumber;
    }

    /**
     * Keeps the inverse side in sync. Only meant to be called by {@link Contact}; use
     * {@link Contact#joinCompany(Company)} to link a contact.
     */
    public void linkContact(Contact contact) {
        contacts.add(contact);
    }

    /** Counterpart of {@link #linkContact(Contact)}, called by {@link Contact#leaveAllCompanies()}. */
    public void unlinkContact(Contact contact) {
        contacts.remove(contact);
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public String getVatNumber() { return vatNumber; }
    public Set<Contact> getContacts() { return Collections.unmodifiableSet(contacts); }
}
