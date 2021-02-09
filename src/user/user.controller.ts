import { Body, Controller, Get, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from 'src/shared/auth.guard';
import { ValidationPipe2 } from '../shared/validation.pipe';
import { User } from './user.decorator';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(private userService: UserService){}

    @Get('api/users')
    showAllUsers(@Query('page') page: number){
        return this.userService.showAll(page);
    }

    @Post('login')
    @UsePipes(new ValidationPipe2())
    login(@Body() data: UserDto){
        return this.userService.login(data);

    }

    @Post('register')
    @UsePipes(new ValidationPipe2())
    register(@Body() data: UserDto){
        return this.userService.register(data);
    }
        
}
