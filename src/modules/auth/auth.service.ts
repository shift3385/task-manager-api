import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    // Decode token to get expiration
    const decoded: any = this.jwtService.decode(token);
    if (!decoded) {
      throw new BadRequestException('Invalid token');
    }

    const expiration = decoded.exp;
    const now = Math.floor(Date.now() / 1000);
    const ttl = expiration - now;

    if (ttl > 0) {
      await this.redisService.addToBlacklist(token, ttl);
    }

    return { message: 'Logged out successfully' };
  }
}
