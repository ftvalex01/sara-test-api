// src/auth/dto/login-user.dto.ts

import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @MinLength(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres' })
    @MaxLength(20, { message: 'El nombre de usuario no debe exceder los 20 caracteres' })
    username: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password: string;
}
