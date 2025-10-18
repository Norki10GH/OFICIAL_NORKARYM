// functions/test/userController.test.js
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

await jest.unstable_mockModule('../src/config/db.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

const { registerNewUser } = await import('../src/controllers/userController.js');
const { default: db } = await import('../src/config/db.js');

describe('registerNewUser', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: 'POST',
      body: {
        dades: {
          nom_complet_k_reg: 'Test User',
          email_k_reg: 'test@example.com',
        },
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    db.query.mockResolvedValue({ rows: [{ id_k_reg: 1 }] });

    await registerNewUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      message: 'Sol·licitud de registre enviada correctament!',
      userId: 1,
    });
  });

  it('should return a 400 error if required fields are missing', async () => {
    req.body.dades = {};

    await registerNewUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: "Les dades són invàlides. Es requereix 'nom_complet_k_reg' i 'email_k_reg'.",
    });
  });
});
