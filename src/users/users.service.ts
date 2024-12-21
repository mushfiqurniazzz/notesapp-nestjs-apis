import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUser, login } from './users.zod';
import { ZodError } from 'zod';
import { hashPassword, comparePassword } from 'src/utils/hashing';
import { Prisma, Users } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  //create user route
  createUser = async (data: typeof createUser): Promise<{}> => {
    const validateData = createUser.safeParse(data);

    if (!validateData.success) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Failed in type validation.',
          errors: validateData.error.errors[0].message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const duplicateUser = await this.prisma.users.findUnique({
      where: { email: validateData.data.email },
    });

    if (duplicateUser) {
      throw new HttpException(
        {
          state: 'error',
          message: 'A user with this email already exists.',
        },
        HttpStatus.CONFLICT,
      );
    }

    try {
      const hashedPassword = await hashPassword(validateData.data.password);

      const user = await this.prisma.users.create({
        data: {
          name: validateData.data.name,
          email: validateData.data.email,
          password: hashedPassword,
        },
      });

      return {
        state: 'success',
        message: 'User has been created.',
        id: user.id,
      };
    } catch (error) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Something went wrong.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  //login user route
  login = async (
    data: typeof login,
  ): Promise<{ state: string; message: string; token: string }> => {
    const validateData = login.safeParse(data);

    if (!validateData.success) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Failed in type validation.',
          errors: validateData.error.errors[0].message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const foundUser: Users = await this.prisma.users.findUnique({
      where: {
        email: validateData.data.email,
      },
    });

    if (!foundUser) {
      throw new HttpException(
        {
          state: 'error',
          message: 'No user found with this email.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const isPasswordValid = await comparePassword(
      validateData.data.password,
      foundUser.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Incorrect password.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const token = this.authService.generateToken(foundUser);

      return {
        state: 'success',
        message: 'User logged in.',
        token,
      };
    } catch (error) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Something went wrong.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };
}
