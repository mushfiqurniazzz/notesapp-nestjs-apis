import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUser } from './users.zod';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() data: typeof createUser) {
    return this.usersService.createUser(data);
  }
}
