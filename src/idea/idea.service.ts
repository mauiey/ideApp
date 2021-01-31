import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { IdeaDTO, IdeaRo } from './idea.dto';

import { IdeaEntity } from './idea.entity';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
        private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ){}

    private ideaToResponseObject(idea: IdeaEntity): IdeaRo {
        const responseObject: any = {
            ...idea,
            author: idea.author ? idea.author.toResponseObject(false) : null,
        }
        return responseObject;
    }

    private ensureOwnership(idea: IdeaEntity, userId: string){
        if(idea.author.id !== userId){
            throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
        }

    }

    async showAll(): Promise<IdeaRo[]>{
        const ideas = await this.ideaRepository.find({ relations: ['author'] });
        return ideas.map(idea => this.ideaToResponseObject(idea));
    }

    async create(userId: string, data: IdeaDTO): Promise<IdeaRo>{
        const user = await this.userRepository.findOne({where: {id: userId}});        
        const idea = await this.ideaRepository.create({...data, author:user});
        await this.ideaRepository.save(idea);
        return this.ideaToResponseObject(idea);
    }

    async read(id: string): Promise<IdeaRo>{
        const idea = await this.ideaRepository.findOne({where: { id }, relations: ['author']});
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        return this.ideaToResponseObject(idea);
    }

    async update(id: string, userId: string, data: IdeaDTO): Promise<IdeaRo>{
        let idea = await this.ideaRepository.findOne({ where: {id}, relations: ['author']});
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        this.ensureOwnership(idea,userId);
        await this.ideaRepository.update({id}, data);
        idea = await this.ideaRepository.findOne({ where: { id }, relations: ['author']});
        return this.ideaToResponseObject(idea);
    }

    async destroy(id: string, userId: string){
        const idea = await this.ideaRepository.findOne({ where: {id}, relations: ['author']});
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        this.ensureOwnership(idea,userId);
        await this.ideaRepository.delete({ id });
        return this.ideaToResponseObject(idea);
    }
}
