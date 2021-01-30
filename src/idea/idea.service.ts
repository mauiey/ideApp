import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdeaDTO } from './idea.dto';

import { IdeaEntity } from './idea.entity';

@Injectable()
export class IdeaService {
    constructor(@InjectRepository(IdeaEntity) 
    private ideaRepository: Repository<IdeaEntity>,){}

    async showAll(){
        return await this.ideaRepository.find();
    }

    async create(data: IdeaDTO){
        const idea = await this.ideaRepository.create(data);
        await this.ideaRepository.save(idea);
        return idea;
    }

    async read(id: string){
        const idea = await this.ideaRepository.findOne({where: { id }});
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        return idea;
    }

    async update(id: string, data: IdeaDTO){
        let idea = await this.ideaRepository.findOne({ where: {id}});
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        await this.ideaRepository.update({id}, data);
        idea = await this.ideaRepository.findOne({ where: { id }});
        return idea;
    }

    async destroy(id: string){
        const idea = await this.ideaRepository.findOne({ where: {id}});
        if (!idea) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        await this.ideaRepository.delete({ id });
        return idea;
    }
}
