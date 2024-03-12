import { Injectable } from "@nestjs/common";
import { Repository, DataSource, EntityManager } from "typeorm";

import { UserEntity } from "@entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSignUpDto } from "@dtos/users/post.sign.up.dto";

@Injectable()
export class UserRepository {

    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>
    ) {
    };

    async getUserByEmail(
        email: string
    ){

        const user = await this.userRepo.findOne({
            where: {
                email
            }
        });

        return user
    };

    async getUserById(
        userId: number
    ){

        const user = await this.userRepo.findOne({
            where: {
                userId
            }
        });

        return user;
    };

    async insertUserEntity(
        entityManager: EntityManager,
        body: PostSignUpDto,
        hash: string,
        currTime: string
    ){

        const {
            email,
            name
         } = body;

        const insert = await entityManager.insert(UserEntity, {
            email,
            name,
            password: hash,
            createdAt: currTime
        });

        return insert;
    };

    async updateUserName(
        entityManager: EntityManager,
        userId: number,
        name: string
    ) {

        const update = await entityManager.update(UserEntity, {
            userId
        }, {
            name
        });

        return update;

    };

    async removeUserEntity(
        entityManager: EntityManager,
        userId: number
    ){

        const remove = await entityManager.softDelete(UserEntity, {
            userId
        });

        return remove;
    }

}