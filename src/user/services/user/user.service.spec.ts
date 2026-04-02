import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { User } from '../../../typeorm';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findBy: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash the password and save the user', async () => {
      const userData = { name: 'Alice', email: 'alice@example.com', password: 'plainpass' };
      const savedUser = { id: 1, ...userData, password: 'hashedpass', isAdmin: false };

      userRepository.create.mockReturnValue(savedUser as any);
      userRepository.save.mockResolvedValue(savedUser as any);

      const result = await service.createUser(userData);

      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(savedUser);

      // Ensure the password was hashed (not plain text)
      const createCallArg = userRepository.create.mock.calls[0][0] as any;
      expect(createCallArg.password).not.toBe('plainpass');
      const isHashed = await bcrypt.compare('plainpass', createCallArg.password);
      expect(isHashed).toBe(true);
    });
  });

  describe('getUserByEmail', () => {
    it('should return the user when found', async () => {
      const user = { id: 1, email: 'alice@example.com', name: 'Alice' } as User;
      userRepository.findBy.mockResolvedValue([user]);

      const result = await service.getUserByEmail('alice@example.com');

      expect(userRepository.findBy).toHaveBeenCalledWith({ email: 'alice@example.com' });
      expect(result).toEqual(user);
    });

    it('should return undefined when no user is found', async () => {
      userRepository.findBy.mockResolvedValue([]);

      const result = await service.getUserByEmail('notfound@example.com');

      expect(result).toBeUndefined();
    });
  });
});
