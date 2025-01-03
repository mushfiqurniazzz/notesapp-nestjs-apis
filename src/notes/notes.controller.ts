import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { createNoteZod, updateNoteZod } from './notes.zod';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Req() req: Request, @Body() data: typeof createNoteZod) {
    if (!req.headers['authorization']) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Can not create a note, login first.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.notesService.createNote(
      data,
      req.headers['authorization'].split(' ')[1] as string,
    );
  }

  @Get()
  getNotes(@Req() req: Request) {
    if (!req.headers['authorization']) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Can not view your notes, login first.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.notesService.getNotes(
      req.headers['authorization'].split(' ')[1] as string,
    );
  }

  @Put(':id')
  updateNote(
    @Param() params: any,
    @Req() req: Request,
    @Body() body: typeof updateNoteZod,
  ) {
    if (!req.headers['authorization']) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Can not update your note, login first.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.notesService.updateNote(
      params.id,
      body,
      req.headers['authorization'].split(' ')[1] as string,
    );
  }

  @Delete(':id')
  deleteNote(@Param() params: any, @Req() req: Request) {
    if (!req.headers['authorization']) {
      throw new HttpException(
        {
          state: 'error',
          message: 'Can not delete your note, login first.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.notesService.deleteNote(
      params.id,
      req.headers['authorization'].split(' ')[1] as string,
    );
  }
}
