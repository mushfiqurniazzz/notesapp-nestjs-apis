import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET as string;

  generateToken = (foundUser: Users): string => {
    return jwt.sign(
      {
        id: foundUser.id,
      },
      this.jwtSecret,
      {
        expiresIn: '30d',
      },
    );
  };

  verifyToken = (token: string): { id: string } => {
    try {
      const decodeData = jwt.verify(token, this.jwtSecret);
      return decodeData as { id: string };
    } catch (error) {
      throw new HttpException(
        {
          state: 'error',
          message: 'You are not authorized for this resource.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  };
}
