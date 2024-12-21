import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUser, login } from './users.zod';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() data: typeof createUser) {
    return this.usersService.createUser(data);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() data: typeof login) {
    return this.usersService.login(data);
  }
}
