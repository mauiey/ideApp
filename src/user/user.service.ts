import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto, UserRo } from './user.dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) 
        private userRepository: Repository<UserEntity>,
    ) {}

    async showAll(): Promise<UserRo[]>{
        const users = await this.userRepository.find();
        return users.map(user => user.toResponseObject(true));
    }

    async login(data: UserDto): Promise<UserRo>{
        const {username, password} = data;
        const user = await this.userRepository.findOne({where: {username}});
        if (!user || !(await user.comparePassword(password))){
            throw new HttpException('Invalid username/password', HttpStatus.BAD_REQUEST,);
        }
        return user.toResponseObject();
    }
    async register(data: UserDto): Promise<UserRo>{
        const {username} = data;
        let user = await this.userRepository.findOne({where: {username}});
        if (user){
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
        }
        user = await this.userRepository.create(data);
        await this.userRepository.save(user);
        return user.toResponseObject();
    }
}
