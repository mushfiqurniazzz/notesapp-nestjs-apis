import { Body, Controller, Delete, HttpCode, Post, Req } from '@nestjs/common';
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

  @Delete()
  deleteUser(@Req() req: Request) {
    return this.usersService.deleteUser(
      req.headers['authorization'].split(' ')[1] as string,
    );
  }
}
