// src/auth/auth.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import '../firebase.config'; 

@Injectable()
export class AuthService {
  constructor(
    //private usersService: UsersService, ahora usamos Firebase
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, username, pass);
      const user = userCredential.user;
      return { username: user.email, uid: user.uid };
    } catch (error) {
      return null;
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const user = await this.validateUser(loginUserDto.username, loginUserDto.password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const payload = { username: user.username, sub: user.uid };
    return {
      access_token: this.jwtService.sign(payload),
      username: user.username,
      userId: user.uid
    };
  }
}
