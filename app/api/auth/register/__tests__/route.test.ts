/**
 * STE Assignment - Travel Planner
 * Unit tests for Register API route
 * Adit Shriyans | BT22CSE007
 */

import { POST } from '../route';

jest.mock('@utils/database', () => ({
  connectToDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@models/user', () => {
  const mockFindOneFn = jest.fn();
  const mockSaveFn = jest.fn();
  function MockUser(this: any, data: any) {
    this._id = data._id || 'newid';
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.save = mockSaveFn;
    this.toJSON = () => ({ _id: this._id, username: this.username, email: this.email, password: this.password });
    return this;
  }
  (MockUser as any).findOne = mockFindOneFn;
  (MockUser as any).__mockFindOne = mockFindOneFn;
  (MockUser as any).__mockSave = mockSaveFn;
  return { __esModule: true, default: MockUser };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn((pass: string) => Promise.resolve(`hashed_${pass}`)),
}));

import User from '@models/user';

const mockFindOne = (User as any).__mockFindOne as jest.Mock;
const mockSave = (User as any).__mockSave as jest.Mock;

function createRequest(body: object) {
  return {
    json: () => Promise.resolve(body),
  } as any;
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSave.mockResolvedValue(undefined);
  });

  it('should return 400 when user already exists', async () => {
    mockFindOne.mockResolvedValue({ email: 'existing@test.com' });

    const req = createRequest({
      username: 'newuser',
      email: 'existing@test.com',
      password: 'password123',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.message).toBe('User already exists');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('should return 201 and create user when registration is successful', async () => {
    mockFindOne.mockResolvedValue(null);
    mockSave.mockResolvedValue(undefined);

    const req = createRequest({
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.username).toBe('newuser');
    expect(data.email).toBe('new@test.com');
    expect(data.password).toBe('hashed_password123');
    expect(mockSave).toHaveBeenCalled();
  });

  it('should return 500 when save fails', async () => {
    mockFindOne.mockResolvedValue(null);
    mockSave.mockRejectedValue(new Error('MongoDB save error'));

    const req = createRequest({
      username: 'newuser',
      email: 'new@test.com',
      password: 'password123',
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.message).toBe('Failed to create new user');
  });
});
