import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { User } from 'src/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private jwtService: JwtService,
  ) {}

  /** * Authenticates the user
   *
   * @param string $email the email of the user to be authenticated
   * @param string $password The password of the user to be authenticated
   *
   * @throws  NotAcceptableException If the provided email is not associated with any accounts
   * @throws  NotAcceptableException If the provided email is not associated with any accounts
   * @return the user if valid or null
   */

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) return null;
    const passwordValid = await bcrypt.compare(password, user.password);
    if (user && passwordValid) {
      return user;
    }
    return null;
  }

  /** * Generates access token for the verified user
   *
   * @param User $user The user that passed the authentication
   *
   * @return access_token for the user
   */

  async login(user: User): Promise<{ access_token: string }> {
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: jwtConstants.secret,
      }),
    };
  }
}
