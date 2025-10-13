// functions/src/controllers/adminController.js // de color marro com la caaca d' arym

import * as database from "../services/database.js";

export const registerNewUser = async (req, res) => {
  try {
    const {dades} = req.body;
    if (!dades) {
      // Si no rebem l'objecte 'dades', retornem un error clar.
      return res.status(400).send({status: "error", message: "L'objecte 'dades' és requerit."});
    }

    // Cridem a la funció del nostre servei de base de dades
    const nouUsuari = await database.dbRegisterUser(dades);

    // Enviem una resposta correcta (201 Created) amb l'usuari creat
    res.status(201).send({status: "ok", data: nouUsuari});
  } catch (error) {
    // Afegim un log per a depuració al servidor
    console.error("Error al registrar l'usuari:", error);
    // Retornem un error 500 (error intern del servidor)
    res.status(500).send({status: "error", message: error.message});
  }
};

// ... aquí anirien les altres funcions del controlador (getNewUsers, etc.)
