package com.example.contacts.contact;

import com.example.contacts.common.NotFoundException;
import com.example.contacts.contact.dto.ContactRequest;
import com.example.contacts.contact.dto.ContactResponse;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;

    public ContactService(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> findAll() {
        return contactRepository.findAll(Sort.by("id")).stream().map(ContactResponse::from).toList();
    }

    public ContactResponse create(ContactRequest request) {
        Contact contact = new Contact();
        apply(contact, request);
        return ContactResponse.from(contactRepository.save(contact));
    }

    public ContactResponse update(Long id, ContactRequest request) {
        Contact contact = getEntity(id);
        apply(contact, request);
        return ContactResponse.from(contact);
    }

    public void delete(Long id) {
        Contact contact = getEntity(id);
        new ArrayList<>(contact.getCompanies()).forEach(company -> company.getContacts().remove(contact));
        contactRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Contact getEntity(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contact " + id + " introuvable"));
    }

    private void apply(Contact contact, ContactRequest request) {
        contact.setFirstName(request.firstName());
        contact.setLastName(request.lastName());
        contact.setAddress(request.address());
        contact.setType(request.type());
        contact.setVatNumber(request.vatNumber());
    }
}
