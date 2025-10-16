-- =================================================================
-- SCRIPT DE RESETEIG COMPLET DE LA BASE DE DADES NORKARYM
-- =================================================================
-- ATENCIÓ: Aquest script esborrarà TOTES les dades de les taules
-- i les restaurarà a l'estat inicial de desenvolupament.
-- NO l'executis en un entorn de producció.
-- =================================================================

-- Pas 1: Buidar totes les taules.
-- L'ordre és important per a les claus foranes.
-- Comencem per les taules que connecten altres (molts a molts).
TRUNCATE
    taula_projectes_usuaris_nk,
    taula_usuaris_rols_nk
    RESTART IDENTITY CASCADE;

-- Continuem amb les taules que tenen dades transaccionals.
TRUNCATE
    taula_admins_nk,
    taula_auditoria_nk,
    taula_emails_nk,
    taula_projectes_nk,
    taula_rols_nk,
    taula_users_ky,
    taula_versions_ky
    RESTART IDENTITY CASCADE;

-- Finalment, buidem les taules mestres (lookup tables).
TRUNCATE
    taula_rols_definicions_nk,
    taula_estats_nk,
    taula_tipus_ky
    RESTART IDENTITY CASCADE;

-- =================================================================
-- Pas 2: Inserir les dades inicials (Seeding) a les taules mestres.
-- =================================================================

-- Dades per a taula_rols_definicions_nk
INSERT INTO taula_rols_definicions_nk (id_rol_def_nk, nom_rol_def_nk, descripcio_rol_def_nk) VALUES
(1, 'BÀSIC', 'Accés a les funcionalitats essencials de l''aplicació.'),
(2, 'PREMIUM', 'Accés a totes les funcionalitats, incloent les avançades.'),
(3, 'EDITOR', 'Permisos per crear i modificar contingut dins de l''aplicació.'),
(4, 'ADMINISTRADOR', 'Control total sobre la gestió d''usuaris i configuracions del sistema.');

-- Dades per a taula_estats_nk
INSERT INTO taula_estats_nk (id_estat_nk, nom_estat_nk, descripcio_estat_nk) VALUES
(1, 'ACTIU', 'L''usuari té accés complet i totes les funcionalitats actives.'),
(2, 'PENDENT VALIDACIO', 'L''usuari s''ha registrat però està pendent de validació per part d''un administrador.'),
(3, 'INACTIU', 'L''usuari ha estat desactivat i no pot accedir al sistema.');



-- =================================================================
-- Reseteig completat. La base de dades està en el seu estat inicial.
-- =================================================================