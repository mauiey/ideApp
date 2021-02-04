import { IsNotEmpty } from "class-validator";
import { IdeaEntity } from "src/idea/idea.entity";

export class UserDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}

export class UserRo {
    id: string;
    username: string;
    created: Date;
    token?: string;
    ideas?: IdeaEntity[];
    bookmarks?: IdeaEntity[];
}