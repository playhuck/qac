import { Injectable } from "@nestjs/common";
import { Repository, DataSource, EntityManager } from "typeorm";

import { UserEntity } from "@entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class UserRepository {

    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>
    ) {
    };

    async getUser(){

        const user = await this.userRepo.find();

        return user
    }

    async insertUser(){

        const insert = await this.userRepo.insert({
            email: 'hello',
            name: 'hello2',
            password: '1234'
        });

        return insert;
    }
}