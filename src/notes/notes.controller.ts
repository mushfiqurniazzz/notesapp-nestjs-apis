import { Body, Controller, Post, Req } from '@nestjs/common';
import { NotesService } from './notes.service';
import { createNoteZod } from './notes.zod';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Req() req: Request, @Body() data: typeof createNoteZod) {
    return this.notesService.createNote(
      data,
      req.headers['authorization'].split(' ')[1] as string,
    );
  }
}
