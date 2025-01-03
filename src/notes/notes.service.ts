import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { createNoteZod, updateNoteZod } from './notes.zod';
import { Notes } from '@prisma/client';
import { error } from 'console';

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

  getNotes = async (
    token: string,
  ): Promise<{ state: string; message: string; data: Notes[] }> => {
    const verifyUser = this.authService.verifyToken(token);

    const userId = verifyUser.id;

    try {
      const postDocuments = await this.prisma.notes.findMany({
        where: {
          authorId: userId,
        },
      });

      return {
        state: 'success',
        message: 'Notes have been fetched.',
        data: postDocuments,
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

  updateNote = async (
    noteId: string,
    data: typeof updateNoteZod,
    token: string,
  ): Promise<{
    state: string;
    message: string;
    data: Notes;
  }> => {
    const verifyUser = this.authService.verifyToken(token);

    const validateData = updateNoteZod.safeParse(data);

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

    const userId = verifyUser.id;

    const postDocument = await this.prisma.notes.findUnique({
      where: {
        id: noteId,
      },
    });

    if (!postDocument) {
      throw new HttpException(
        {
          state: 'error',
          message: 'No note found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (postDocument.authorId !== userId) {
      throw new HttpException(
        {
          state: 'error',
          message: 'You are not the author to update this note.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      postDocument.title === validateData.data.title &&
      postDocument.paragraph === validateData.data.paragraph
    ) {
      throw new HttpException(
        {
          state: 'error',
          message: 'No changes found to update note.',
        },
        HttpStatus.CONFLICT,
      );
    }
    try {
      const updatePostDocument = await this.prisma.notes.update({
        where: {
          id: postDocument.id,
        },
        data: {
          title: validateData.data.title,
          paragraph: validateData.data.paragraph,
        },
      });

      return {
        state: 'success',
        message: 'Note has been updated.',
        data: updatePostDocument,
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
