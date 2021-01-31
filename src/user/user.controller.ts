import { Body, Controller, Get, Post, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from 'src/shared/auth.guard';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { User } from './user.decorator';
import { UserDto } from './user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(private userService: UserService){}

    @Get('api/users')
    @UseGuards(new AuthGuard())
    showAllUsers(@User() user){
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
