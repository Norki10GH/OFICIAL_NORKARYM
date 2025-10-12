
import * as database from "../services/database.js";

export const getNewUsers = async (req, res) => {
  try {
    const data = await database.dbGetNewUsers();
    res.status(200).send({status: "ok", data});
  } catch (error) {
    res.status(500).send({status: "error", message: error.message});
  }
};

export const updateNewUser = async (req, res) => {
  try {
    const {dades} = req.body;
    const data = await database.dbUpdateNewUser(dades);
    res.status(200).send({status: "ok", data});
  } catch (error) {
    res.status(500).send({status: "error", message: error.message});
  }
};

export const registerNewUser = async (req, res) => {
  try {
    const {dades} = req.body;
    const data = await database.dbRegisterUser(dades);
    res.status(200).send({status: "ok", data});
  } catch (error) {
    res.status(500).send({status: "error", message: error.message});
  }
};

export const getUsersSummary = async (req, res) => {
  try {
    // This function is not in the database file, so we'll add a placeholder
    // TODO: Implementar la lògica per obtenir el resum d'usuaris.
    console.log("Obtenint resum d'usuaris...");
    const data = {
      total: 0,
      registered: 0,
      pending: 0,
    };
    res.status(200).send({status: "ok", data});
  } catch (error) {
    res.status(500).send({status: "error", message: error.message});
  }
};
