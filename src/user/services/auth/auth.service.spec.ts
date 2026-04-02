import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../../../typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: { getUserByEmail: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return the user when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = { id: 1, email: 'alice@example.com', password: hashedPassword } as User;
      userService.getUserByEmail.mockResolvedValue(user);

      const result = await service.validateUser('alice@example.com', 'password123');

      expect(result).toEqual(user);
    });

    it('should return null when user does not exist', async () => {
      userService.getUserByEmail.mockResolvedValue(undefined);

      const result = await service.validateUser('nobody@example.com', 'password');

      expect(result).toBeNull();
    });

    it('should return null when password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correctpass', 10);
      const user = { id: 1, email: 'alice@example.com', password: hashedPassword } as User;
      userService.getUserByEmail.mockResolvedValue(user);

      const result = await service.validateUser('alice@example.com', 'wrongpass');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token signed with the JWT secret', async () => {
      const user = { id: 1, email: 'alice@example.com' } as User;
      configService.get.mockReturnValue('test-secret');
      jwtService.sign.mockReturnValue('signed-token');

      const result = await service.login(user);

      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: 'alice@example.com', id: 1 },
        { secret: 'test-secret' },
      );
      expect(result).toEqual({ access_token: 'signed-token' });
    });
  });
});
