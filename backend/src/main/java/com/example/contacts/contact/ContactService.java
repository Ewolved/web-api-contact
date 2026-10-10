package com.example.contacts.contact;

import com.example.contacts.common.NotFoundException;
import com.example.contacts.contact.dto.ContactRequest;
import com.example.contacts.contact.dto.ContactResponse;
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
        Contact contact = new Contact(request.firstName(), request.lastName(), request.address(),
                request.type(), request.vatNumber());
        return ContactResponse.from(contactRepository.save(contact));
    }

    public ContactResponse update(Long id, ContactRequest request) {
        Contact contact = getEntity(id);
        contact.update(request.firstName(), request.lastName(), request.address(),
                request.type(), request.vatNumber());
        return ContactResponse.from(contact);
    }

    public void delete(Long id) {
        Contact contact = getEntity(id);
        contact.leaveAllCompanies();
        contactRepository.delete(contact);
    }

    /** Loads a managed contact for use within the caller's transaction. */
    public Contact getEntity(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Contact " + id + " introuvable"));
    }
}
