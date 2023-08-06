import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.interface';
import 'dotenv/config';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) { }

  async generateToken(user: User): Promise<string> {
    const payload = { sub: user.id, username: user.username };

    return this.jwtService.signAsync(payload, { secret: process.env.SECRET_KEY });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      return null;
    }
  }

  async validateUser(username: string, password: string): Promise<boolean> {
    // This is a fake validation
    return true;
  }
}