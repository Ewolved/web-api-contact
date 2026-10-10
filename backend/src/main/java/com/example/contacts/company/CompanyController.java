package com.example.contacts.company;

import com.example.contacts.company.dto.CompanyRequest;
import com.example.contacts.company.dto.CompanyResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/companies")
@Tag(name = "Entreprises")
public class CompanyController {

    private final CompanyService service;

    public CompanyController(CompanyService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lister les entreprises")
    public List<CompanyResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/search")
    @Operation(summary = "Rechercher une entreprise par numéro de TVA")
    public CompanyResponse search(@RequestParam String vatNumber) {
        return service.findByVatNumber(vatNumber);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une entreprise")
    public CompanyResponse create(@Valid @RequestBody CompanyRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une entreprise")
    public CompanyResponse update(@PathVariable Long id, @Valid @RequestBody CompanyRequest request) {
        return service.update(id, request);
    }

    @PutMapping("/{companyId}/contacts/{contactId}")
    @Operation(summary = "Rattacher un contact à une entreprise")
    public CompanyResponse addContact(@PathVariable Long companyId, @PathVariable Long contactId) {
        return service.addContact(companyId, contactId);
    }
}
