import { IdeaEntity } from "src/idea/idea.entity";
import { UserEntity } from "src/user/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('comment')
export class CommentEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    date: Date;

    @Column('text')
    comment: string;

    @ManyToOne(type => UserEntity)
    @JoinTable()
    author: UserEntity;

    @ManyToOne(type => IdeaEntity, idea => idea.comments)
    idea: IdeaEntity;
}