// functions/src/services/database.js
import db from "../config/db.js";
/**
 * Insereix un nou usuari a la base de dades amb estat 'PENDENT VALIDACIO'.
 * @param {object} dadesUsuari Dades de l'usuari a registrar.
 * @return {Promise<object>} L'usuari inserit.
 */
export const dbRegisterUser = async (dadesUsuari) => {
  const {
    nom,
    cognoms,
    email,
    dni,
    telefon,
    adreca,
    poblacio,
    codiPostal,
    pais,
    comentaris,
  } = dadesUsuari;

  const nomComplet = `${nom} ${cognoms}`;

  // Busquem l'ID de l'estat 'PENDENT VALIDACIO'
  const estatResult = await db.query(
      "SELECT id_estat_nk FROM taula_estats_nk " +
      "WHERE nom_estat_nk = 'PENDENT VALIDACIO'",
  );
  if (estatResult.rows.length === 0) {
    // Si no trobem l'estat, és un error de configuració de la BD. Parem aquí.
    throw new Error("Estat inicial 'PENDENT VALIDACIO' no trobat a la base de dades.");
  }
  const idEstatInicial = estatResult.rows[0].id_estat_nk;

  const query = `
    INSERT INTO taula_users_ky(
      nom_complet_k_reg, email_k_reg, dni_cif_k_reg, telefon_k_reg, 
      domicili_k_reg, poblacio_k_reg, cp_k_reg, pais_k_reg, 
      notes_k_reg, id_estat_k_reg, data_solicitud_k_reg
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
    RETURNING id_k_reg, nom_complet_k_reg, email_k_reg;
  `;

  const values = [
    nomComplet, email, dni, telefon,
    adreca, poblacio, codiPostal, pais,
    comentaris, idEstatInicial,
  ];

  const {rows} = await db.query(query, values);
  return rows[0];
};

// Aquí podríem afegir més funcions de base de dades en el futur
// export const dbGetUsers = async () => { ... };
// export const dbUpdateUser = async (id, dades) => { ... };
