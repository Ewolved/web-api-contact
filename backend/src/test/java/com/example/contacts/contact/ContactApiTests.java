package com.example.contacts.contact;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
class ContactApiTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsSeededContactsSortedById() throws Exception {
        mockMvc.perform(get("/api/contacts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].lastName").value("Martin"))
                .andExpect(jsonPath("$[2].companies.length()").value(2));
    }

    @Test
    void createsEmployeeWithoutVat() throws Exception {
        mockMvc.perform(post("/api/contacts").contentType(MediaType.APPLICATION_JSON).content("""
                        {"firstName":"Eva","lastName":"Janssens","address":"1 rue X","type":"EMPLOYEE"}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.vatNumber").doesNotExist())
                .andExpect(jsonPath("$.companies.length()").value(0));
    }

    @Test
    void createsFreelanceWithStrippedVat() throws Exception {
        mockMvc.perform(post("/api/contacts").contentType(MediaType.APPLICATION_JSON).content("""
                        {"firstName":"Eva","lastName":"Janssens","address":"1 rue X","type":"FREELANCE","vatNumber":"  BE0999  "}
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.vatNumber").value("BE0999"));
    }

    @Test
    void rejectsFreelanceWithoutVatOnVatField() throws Exception {
        mockMvc.perform(post("/api/contacts").contentType(MediaType.APPLICATION_JSON).content("""
                        {"firstName":"Eva","lastName":"Janssens","address":"1 rue X","type":"FREELANCE","vatNumber":"   "}
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.vatNumber").value("Un freelance doit avoir un numéro de TVA"));
    }

    @Test
    void rejectsMissingRequiredFields() throws Exception {
        mockMvc.perform(post("/api/contacts").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.firstName").exists())
                .andExpect(jsonPath("$.errors.lastName").exists())
                .andExpect(jsonPath("$.errors.address").exists())
                .andExpect(jsonPath("$.errors.type").exists());
    }

    @Test
    void updatesContactKeepingItsCompanies() throws Exception {
        mockMvc.perform(put("/api/contacts/3").contentType(MediaType.APPLICATION_JSON).content("""
                        {"firstName":"Claire","lastName":"Leroy-Dubois","address":"30 chaussée de Namur","type":"FREELANCE","vatNumber":"BE0200000001"}
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastName").value("Leroy-Dubois"))
                .andExpect(jsonPath("$.companies.length()").value(2));
    }

    @Test
    void updateOfUnknownContactReturns404() throws Exception {
        mockMvc.perform(put("/api/contacts/999").contentType(MediaType.APPLICATION_JSON).content("""
                        {"firstName":"A","lastName":"B","address":"C","type":"EMPLOYEE"}
                        """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Contact 999 introuvable"));
    }

    @Test
    void deletesContactAttachedToCompanies() throws Exception {
        mockMvc.perform(delete("/api/contacts/3")).andExpect(status().isNoContent());

        mockMvc.perform(get("/api/contacts")).andExpect(jsonPath("$.length()").value(3));
        mockMvc.perform(get("/api/companies/search").param("vatNumber", "BE0100000001"))
                .andExpect(jsonPath("$.contacts.length()").value(1));
    }

    @Test
    void deleteOfUnknownContactReturns404() throws Exception {
        mockMvc.perform(delete("/api/contacts/999")).andExpect(status().isNotFound());
    }
}
