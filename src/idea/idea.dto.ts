import { IsString } from 'class-validator';
import { UserRo } from 'src/user/user.dto';

export class IdeaDTO {
    @IsString()
    readonly idea: string;

    @IsString()
    readonly description: string;
}

export class IdeaRo {
    id?: string;
    updated: Date;
    created: Date;
    idea: string;
    description: string;
    author: UserRo;
    upvotes?: number;
    downvotes?: number;
}