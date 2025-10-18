// functions/test/api.test.js
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/api.js';

describe('API routing', () => {
  it('should return 404 for non-POST requests to /registerNewUser', async () => {
    const response = await request(app).get('/registerNewUser');
    expect(response.status).toBe(404);
  });
});
