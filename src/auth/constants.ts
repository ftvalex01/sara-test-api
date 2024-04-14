// src/auth/constants.ts
require('dotenv').config();

export const jwtConstants = {
  secret: process.env.JWT_SECRET, 
};
