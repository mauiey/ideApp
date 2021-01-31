import { Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { userInfo } from 'os';
import { UserEntity } from 'src/user/user.entity';
import { AuthGuard } from '../shared/auth.guard';
import { User } from '../user/user.decorator';
import { IdeaDTO } from './idea.dto';
import { IdeaEntity } from './idea.entity';
import { IdeaService } from './idea.service';

@Controller('api/ideas')
export class IdeaController {
    private logger = new Logger('IdeaController');
    constructor(private ideaService: IdeaService){}

    private logData(options: any) {
        options.user && this.logger.log('USER' + JSON.stringify(options.user));
        options.data && this.logger.log('DATA' + JSON.stringify(options.body));
        options.id && this.logger.log('IDEA' + JSON.stringify(options.id));
    }

    @Get()
    showAllIdeas(){
        return this.ideaService.showAll();
    }

    @Post()
    @UseGuards(new AuthGuard())
    @UsePipes(new ValidationPipe())
    createIdea(@User('id') user,@Body() body: IdeaDTO){
        this.logData({user, body});
        return this.ideaService.create(user, body);
    }

    @Get(':id')
    readIdea(@Param('id') id: string){
        return this.ideaService.read(id);
    }

    @Patch(':id')
    @UseGuards(new AuthGuard())
    updateIdea(
        @Param('id') id: string,
        @User('id') user: string, 
        @Body(new ValidationPipe({ skipMissingProperties: true})) data: IdeaDTO){
        this.logData({id, user, data});
        return this.ideaService.update(id, user, data);
    }

    @Delete(':id')
    @UseGuards( new AuthGuard())
    destroyIdea(@Param('id') id: string, @User('id') user){
        this.logData({id, user});
        return this.ideaService.destroy(id, user);
    }
}
