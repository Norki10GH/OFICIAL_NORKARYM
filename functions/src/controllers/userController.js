// proves varies --- cambis per la main
export const processNewUser = async (req, res) => {
  try {
    // TODO: Implementar la lògica per processar un nou usuari.
    const {dades} = req.body;
    console.log("Processant nou usuari:", dades);
    res.status(200).send({
      status: "ok",
      data: {message: "Usuari processat correctament."},
    });
  } catch (error) {
    res.status(500).send({status: "error", message: error.message});
  }
};

export const sendContactEmail = async (req, res) => {
  try {
    // TODO: Implementar la lògica per enviar un correu de contacte.
    const {dades} = req.body;
    console.log("Enviant correu de contacte:", dades);
    res.status(200).send({
      status: "ok",
      data: {message: "Correu enviat correctament."},
    });
  } catch (error) {
    res.status(500).send({status: "error", message: error.message});
  }
};
