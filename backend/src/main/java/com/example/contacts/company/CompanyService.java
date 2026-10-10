package com.example.contacts.company;

import com.example.contacts.common.ConflictException;
import com.example.contacts.common.NotFoundException;
import com.example.contacts.company.dto.CompanyRequest;
import com.example.contacts.company.dto.CompanyResponse;
import com.example.contacts.contact.Contact;
import com.example.contacts.contact.ContactService;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final ContactService contactService;

    public CompanyService(CompanyRepository companyRepository, ContactService contactService) {
        this.companyRepository = companyRepository;
        this.contactService = contactService;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> findAll() {
        return companyRepository.findAll(Sort.by("id")).stream().map(CompanyResponse::from).toList();
    }

    public CompanyResponse create(CompanyRequest request) {
        if (companyRepository.existsByVatNumber(request.vatNumber())) {
            throw vatConflict(request.vatNumber());
        }
        Company company = new Company();
        apply(company, request);
        return CompanyResponse.from(companyRepository.save(company));
    }

    public CompanyResponse update(Long id, CompanyRequest request) {
        Company company = getEntity(id);
        if (companyRepository.existsByVatNumberAndIdNot(request.vatNumber(), id)) {
            throw vatConflict(request.vatNumber());
        }
        apply(company, request);
        return CompanyResponse.from(company);
    }

    @Transactional(readOnly = true)
    public CompanyResponse findByVatNumber(String vatNumber) {
        return companyRepository.findByVatNumber(vatNumber)
                .map(CompanyResponse::from)
                .orElseThrow(() -> new NotFoundException(
                        "Aucune entreprise avec le numéro de TVA " + vatNumber));
    }

    public CompanyResponse addContact(Long companyId, Long contactId) {
        Company company = getEntity(companyId);
        Contact contact = contactService.getEntity(contactId);
        contact.getCompanies().add(company);
        company.getContacts().add(contact);
        return CompanyResponse.from(company);
    }

    private Company getEntity(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Entreprise " + id + " introuvable"));
    }

    private ConflictException vatConflict(String vat) {
        return new ConflictException("Le numéro de TVA " + vat + " est déjà utilisé");
    }

    private void apply(Company company, CompanyRequest request) {
        company.setName(request.name());
        company.setAddress(request.address());
        company.setVatNumber(request.vatNumber());
    }
}
