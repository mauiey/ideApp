import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { Repository } from 'typeorm';
import { IdeaDTO, IdeaRo } from './idea.dto';

import { IdeaEntity } from './idea.entity';
import { response } from 'express';
import { Votes } from 'src/shared/votes.enum';

@Injectable()
export class IdeaService {
    constructor(
        @InjectRepository(IdeaEntity)
        private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ){}

    private ideaToResponseObject(idea: IdeaEntity): IdeaRo {
        console.log('1');
        const responseObject: any = { 
            ...idea, author: idea.author ? idea.author.toResponseObject(false): null, };
        console.log(responseObject);
        if (idea.upvotes){
            console.log('2');
            responseObject.upvotes = idea.upvotes.length;
        }
        if (idea.downvotes){
            console.log('3');
            responseObject.downvotes = idea.downvotes.length;
        }
        console.log('4');

        return responseObject;
    }

    private ensureOwnership(idea: IdeaEntity, userId: string){
        if(idea.author.id !== userId){
            throw new HttpException('Incorrect user', HttpStatus.UNAUTHORIZED);
        }
    }

    private async vote(idea: IdeaEntity, user: UserEntity, vote: Votes){
        const opposite = vote === Votes.UP ? Votes.DOWN : Votes.UP;
        if (
            idea[opposite].filter(voter => voter.id === user.id).length > 0 || idea[vote].filter(voter => voter.id === user.id).length > 0
        ){
            idea[opposite] = idea [opposite].filter(voter => voter.id !== user.id);
            idea[vote] = idea[vote].filter(voter=> voter.id !== user.id);
            await this.ideaRepository.save(idea);
        } else if (idea[vote].filter(voter => voter.id === user.id).length < 1 ){
            idea[vote].push(user);
            await this.ideaRepository.save(idea);
        } else {
            throw new HttpException('Unable to cast vote', HttpStatus.BAD_REQUEST);
        }
        return idea;
    }

    async showAll(): Promise<IdeaRo[]>{
        const ideas = await this.ideaRepository.find({ relations: ['author', 'upvotes', 'downvotes'] });
        return ideas.map(idea => this.ideaToResponseObject(idea));
    }

    async create(userId: string, data: IdeaDTO): Promise<IdeaRo>{
        const user = await this.userRepository.findOne({where: {id: userId}});        
        const idea = await this.ideaRepository.create({...data, author:user});
        await this.ideaRepository.save(idea);
        return this.ideaToResponseObject(idea);
    }

    async read(id: string): Promise<IdeaRo>{
        const idea = await this.ideaRepository.findOne({where: { id }, relations: ['author', 'upvotes', 'downvotes']});
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

    async upvote(id: string, userId: string){
        let idea = await this.ideaRepository.findOne({where : {id}, relations: ['author', 'upvotes', 'downvotes']});
        const user = await this.userRepository.findOne({ where: {id:userId}});

        idea = await this.vote(idea, user, Votes.UP);
        return this.ideaToResponseObject(idea);
    }

    async downvote(id: string, userId: string){
        let idea = await this.ideaRepository.findOne({where : {id}, relations: ['author', 'upvotes', 'downvotes']});
        const user = await this.userRepository.findOne({ where: {id:userId}});

        idea = await this.vote(idea, user, Votes.DOWN);
        return this.ideaToResponseObject(idea);
    }

    async bookmark(id: string, userId: string){
        const idea = await this.ideaRepository.findOne({where:{id}});
        const user = await this.userRepository.findOne({where: {id: userId}, relations: ['bookmarks']});

        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length < 1){
            user.bookmarks.push(idea);
            await this.userRepository.save(user);
        } else {
            throw new HttpException('Idea already bookmarked', HttpStatus.BAD_REQUEST);
        }
        return idea;
    }

    async unbookmark(id: string, userId: string){
        const idea = await this.ideaRepository.findOne({where:{id}});
        const user = await this.userRepository.findOne({where: {id: userId}, relations: ['bookmarks']});

        if (user.bookmarks.filter(bookmark => bookmark.id === idea.id).length > 0){
            user.bookmarks = user.bookmarks.filter(bookmark => bookmark.id !== idea.id,)
            await this.userRepository.save(user);
        } else {
            throw new HttpException('Idea already bookmarked', HttpStatus.BAD_REQUEST);
        }
        return user.toResponseObject();

    }
}
