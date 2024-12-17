import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createUser } from './users.zod';
import { ZodError } from 'zod';
import { hashPassword } from 'src/utils/hashing';
import { Prisma, Users } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  //create user route
  createUser = async (data: typeof createUser): Promise<Users> => {
    try {
      const validateData = createUser.parse(data);

      const hashedPassword = await hashPassword(validateData.password);

      const user = await this.prisma.users.create({
        data: {
          name: validateData.name,
          email: validateData.email,
          password: hashedPassword,
        },
      });

      return user;
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        throw new HttpException(
          {
            state: 'error',
            message: 'Failed in type validation.',
            errors: error.errors[0].message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            {
              state: 'error',
              message: 'User with this email already exists.',
            },
            HttpStatus.CONFLICT,
          );
        }
      }
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
