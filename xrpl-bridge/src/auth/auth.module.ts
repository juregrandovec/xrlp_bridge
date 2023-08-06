import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthGuard } from './auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule,
    JwtModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthGuard], // Include AuthGuard and JwtService in the providers array
  exports: [AuthService],
})
export class AuthModule { }