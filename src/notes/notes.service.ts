import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createNoteZod } from './notes.zod';

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  createNote = async (
    data: typeof createNoteZod,
    token: string,
  ): Promise<{ state: string; message: string; id: string }> => {
    const validateData = createNoteZod.safeParse(data);

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

    const verifyUser = this.authService.verifyToken(token);

    if (!verifyUser) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Can not create a note, login first.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userId = verifyUser.id;

    try {
      const noteDocument = await this.prisma.notes.create({
        data: {
          title: validateData.data.title,
          paragraph: validateData.data.paragraph,
          authorId: userId,
        },
      });

      return {
        state: 'success',
        message: 'Note added.',
        id: noteDocument.id,
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
