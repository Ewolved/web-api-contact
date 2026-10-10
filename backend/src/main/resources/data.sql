INSERT INTO company (name, address, vat_number) VALUES ('Acme', '1 rue de la Loi, 1000 Bruxelles', 'BE0100000001');
INSERT INTO company (name, address, vat_number) VALUES ('Globex', '2 avenue Louise, 1050 Bruxelles', 'BE0100000002');
INSERT INTO company (name, address, vat_number) VALUES ('Initech', '3 place Saint-Lambert, 4000 Liège', 'BE0100000003');

INSERT INTO contact (first_name, last_name, address, type, vat_number) VALUES ('Alice', 'Martin', '10 rue Neuve, 1000 Bruxelles', 'EMPLOYEE', NULL);
INSERT INTO contact (first_name, last_name, address, type, vat_number) VALUES ('Bruno', 'Dupont', '20 rue du Pont, 4000 Liège', 'EMPLOYEE', NULL);
INSERT INTO contact (first_name, last_name, address, type, vat_number) VALUES ('Claire', 'Leroy', '30 chaussée de Namur, 5000 Namur', 'FREELANCE', 'BE0200000001');
INSERT INTO contact (first_name, last_name, address, type, vat_number) VALUES ('David', 'Peeters', '40 Meir, 2000 Anvers', 'EMPLOYEE', NULL);

INSERT INTO contact_company (contact_id, company_id) SELECT c.id, co.id FROM contact c, company co WHERE c.last_name = 'Martin' AND co.vat_number = 'BE0100000001';
INSERT INTO contact_company (contact_id, company_id) SELECT c.id, co.id FROM contact c, company co WHERE c.last_name = 'Dupont' AND co.vat_number = 'BE0100000002';
INSERT INTO contact_company (contact_id, company_id) SELECT c.id, co.id FROM contact c, company co WHERE c.last_name = 'Leroy' AND co.vat_number = 'BE0100000001';
INSERT INTO contact_company (contact_id, company_id) SELECT c.id, co.id FROM contact c, company co WHERE c.last_name = 'Leroy' AND co.vat_number = 'BE0100000003';
INSERT INTO contact_company (contact_id, company_id) SELECT c.id, co.id FROM contact c, company co WHERE c.last_name = 'Peeters' AND co.vat_number = 'BE0100000003';
