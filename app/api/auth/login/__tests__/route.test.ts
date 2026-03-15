/**
 * STE Assignment - Travel Planner
 * Unit tests for Login API route
 * Adit Shriyans | BT22CSE007
 */

import { POST } from '../route';

jest.mock('@utils/database', () => ({
  connectToDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@models/user', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
}));

import User from '@models/user';
import bcrypt from 'bcryptjs';

const mockFindOne = User.findOne as jest.Mock;
const mockCompare = bcrypt.compare as jest.Mock;

function createRequest(body: object) {
  return {
    json: () => Promise.resolve(body),
  } as any;
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when user does not exist', async () => {
    mockFindOne.mockResolvedValue(null);

    const req = createRequest({ email: 'nonexistent@test.com', password: 'pass123' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Invalid credentials');
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it('should return 400 when user has no password (Google sign-in only)', async () => {
    mockFindOne.mockResolvedValue({
      _id: 'user123',
      email: 'google@test.com',
      password: null,
    });

    const req = createRequest({ email: 'google@test.com', password: 'any' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Please sign in with Google');
    expect(mockCompare).not.toHaveBeenCalled();
  });

  it('should return 400 when password is incorrect', async () => {
    mockFindOne.mockResolvedValue({
      _id: 'user123',
      email: 'user@test.com',
      password: 'hashedpassword',
    });
    mockCompare.mockResolvedValue(false);

    const req = createRequest({ email: 'user@test.com', password: 'wrongpassword' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('Invalid credentials');
    expect(mockCompare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
  });

  it('should return 200 and set cookie when credentials are valid', async () => {
    const mockUser = {
      _id: 'user123',
      email: 'user@test.com',
      username: 'testuser',
      password: 'hashedpassword',
    };
    mockFindOne.mockResolvedValue(mockUser);
    mockCompare.mockResolvedValue(true);

    const req = createRequest({ email: 'user@test.com', password: 'correctpassword' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain('token=');
    expect(setCookie).toContain('HttpOnly');
  });

  it('should return 500 when database throws', async () => {
    mockFindOne.mockRejectedValue(new Error('DB connection failed'));

    const req = createRequest({ email: 'user@test.com', password: 'pass' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Failed to log in');
  });
});
