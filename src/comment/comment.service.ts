import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaEntity } from 'src/idea/idea.entity';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { CommentDto } from './comment.dto';
import { CommentEntity } from './comment.entity';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
        @InjectRepository(IdeaEntity) private ideaRepository: Repository<IdeaEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    ){}

    private toResponseObject(comment: CommentEntity){
        const responseObject: any = comment;
        if ( comment.author ) {
            responseObject.author = comment.author.toResponseObject();
        }
        return responseObject
    }


    async showByIdea(id: string){
        const idea = await this.ideaRepository.findOne({
            where: {id},
            relations: ['comments', 'comments.author', 'comments.idea'],
        });
        return idea.comments.map(comment => this.toResponseObject(comment));
    }

    async showByUser(id: string){
        const comments = await this.commentRepository.find({
            where: { author: { id }},
            relations: ['author'],
        })
        return comments.map(comment => this.toResponseObject(comment));
    }

    async show(id: string){
        const comment = await this.commentRepository.findOne({
            where: { id }, 
            relations: ['author', 'idea'],
        });
        return this.toResponseObject(comment);
    }

    async create(ideaId: string, userId: string, data: CommentDto){
        const idea = await this.ideaRepository.findOne({where: {id: ideaId}});
        const user = await this.userRepository.findOne({where: {id: userId}});

        const comment = await this.commentRepository.create({
            ...data,
            idea,
            author:user
        });
        await this.commentRepository.save(comment);
        return this.toResponseObject(comment);
    }

    async destroy(id: string ,userId:string){
        const comment = await this.commentRepository.findOne({
            where: {id},
            relations: ['author', 'idea'],
        });
        if(comment.author.id !== userId){
            throw new HttpException('You did not own this comment', HttpStatus.UNAUTHORIZED);
        }
        await this.commentRepository.remove(comment);
    }
}
