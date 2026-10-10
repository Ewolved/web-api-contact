package com.example.contacts.company;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CompanyApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsSeededCompaniesWithContacts() throws Exception {
        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].name").value("Acme"))
                .andExpect(jsonPath("$[0].contacts.length()").value(2));
    }

    @Test
    void createsCompanyWithStrippedVat() throws Exception {
        mockMvc.perform(post("/api/companies").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"Umbrella","address":"5 rue Y","vatNumber":"  BE0100000009 "}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.vatNumber").value("BE0100000009"))
                .andExpect(jsonPath("$.contacts.length()").value(0));
    }

    @Test
    void rejectsDuplicateVatOnCreate() throws Exception {
        mockMvc.perform(post("/api/companies").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"Clone","address":"5 rue Y","vatNumber":" BE0100000001"}
                        """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Le numéro de TVA BE0100000001 est déjà utilisé"));
    }

    @Test
    void rejectsBlankVat() throws Exception {
        mockMvc.perform(post("/api/companies").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"X","address":"5 rue Y","vatNumber":"  "}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.vatNumber").exists());
    }

    @Test
    void updateMayKeepOwnVatButNotTakeAnother() throws Exception {
        mockMvc.perform(put("/api/companies/1").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"Acme SA","address":"1 rue de la Loi","vatNumber":"BE0100000001"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Acme SA"))
                .andExpect(jsonPath("$.contacts.length()").value(2));

        mockMvc.perform(put("/api/companies/1").contentType(MediaType.APPLICATION_JSON).content("""
                        {"name":"Acme SA","address":"1 rue de la Loi","vatNumber":"BE0100000002"}
                        """))
                .andExpect(status().isConflict());
    }

    @Test
    void searchesByStrippedVat() throws Exception {
        mockMvc.perform(get("/api/companies/search").param("vatNumber", " BE0100000003 "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Initech"));
    }

    @Test
    void searchOfUnknownVatReturns404() throws Exception {
        mockMvc.perform(get("/api/companies/search").param("vatNumber", "BE000"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Aucune entreprise avec le numéro de TVA BE000"));
    }

    @Test
    void attachesContactIdempotently() throws Exception {
        for (int i = 0; i < 2; i++) {
            mockMvc.perform(put("/api/companies/2/contacts/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.contacts.length()").value(2));
        }
        mockMvc.perform(get("/api/contacts"))
                .andExpect(jsonPath("$[0].companies.length()").value(2));
    }

    @Test
    void attachingUnknownContactReturns404() throws Exception {
        mockMvc.perform(put("/api/companies/1/contacts/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Contact 999 introuvable"));
    }
}
