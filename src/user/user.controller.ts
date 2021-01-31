import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(private userService: UserService){}

    @Get('api/users')
    showAllUsers(){
        return this.userService.showAll();
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    login(@Body() data: UserDto){
        return this.userService.login(data);

    }

    @Post('register')
    @UsePipes(new ValidationPipe())
    register(@Body() data: UserDto){
        return this.userService.register(data);
    }
        
}
