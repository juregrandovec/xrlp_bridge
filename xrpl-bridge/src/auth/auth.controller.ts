import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() credentials: any): Promise<any> {
    const isValidUser = await this.authService.validateUser(credentials.username, credentials.password);

    if (!isValidUser) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate a fake JWT token
    const token = await this.authService.generateToken({ id: 1, username: credentials.username });
    return { token };
  }
}