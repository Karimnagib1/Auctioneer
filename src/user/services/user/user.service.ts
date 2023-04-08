import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  /** * Creates a user and saves it to the database
   *
   * @param CreateUser $userData an object that encapsulates user data
   *
   * @return the newly created user without the hashed password: {id, name, email, state, city }
   */

  async createUser(userData: CreateUserDto): Promise<any> {
    const { password } = userData;
    const hash = await bcrypt.hash(password, 10);
    userData.password = hash;
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  /** * Brings a user by email from the database if existed
   *
   * @param string $email The email of the wanted user (email is unique for each user)
   *
   * @return returns the user or undefined
   */

  async getUserByEmail(email: string) {
    const users = await this.userRepository.findBy({ email: email });
    const user = users[0];
    return user;
  }
}
