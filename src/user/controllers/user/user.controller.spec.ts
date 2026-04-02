import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../../typeorm';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: { login: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('userSignup', () => {
    const userData = { name: 'Alice', email: 'alice@example.com', password: 'password123' };

    it('should create and return a new user when email does not exist', async () => {
      const created = { id: 1, name: 'Alice', email: 'alice@example.com', password: 'hash' } as User;
      userService.getUserByEmail.mockResolvedValue(undefined);
      userService.createUser.mockResolvedValue(created);

      const result = await controller.userSignup(userData);

      expect(userService.getUserByEmail).toHaveBeenCalledWith('alice@example.com');
      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual({ id: 1, name: 'Alice', email: 'alice@example.com' });
    });

    it('should throw HttpException 400 when email already exists', async () => {
      userService.getUserByEmail.mockResolvedValue({ id: 1, email: 'alice@example.com' } as User);

      await expect(controller.userSignup(userData)).rejects.toThrow(
        new HttpException('Email already exists', 400),
      );
      expect(userService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should call authService.login with the authenticated user from request', async () => {
      const user = { id: 1, email: 'alice@example.com' } as User;
      authService.login.mockResolvedValue({ access_token: 'token-abc' });

      const result = await controller.login({ user });

      expect(authService.login).toHaveBeenCalledWith(user);
      expect(result).toEqual({ access_token: 'token-abc' });
    });
  });

  describe('getProfile', () => {
    it('should return user without password when IDs match', async () => {
      const user = { id: 1, email: 'alice@example.com', name: 'Alice', password: 'hash' } as User;
      userService.getUserByEmail.mockResolvedValue(user);

      const req = { user: { id: 1, email: 'alice@example.com' }, params: { user_id: 1 } };
      const result = await controller.getProfile(req);

      expect(result).toEqual({ id: 1, email: 'alice@example.com', name: 'Alice' });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException when user ID does not match', async () => {
      const req = { user: { id: 2, email: 'alice@example.com' }, params: { user_id: 99 } };

      await expect(controller.getProfile(req)).rejects.toThrow(UnauthorizedException);
    });
  });
});
