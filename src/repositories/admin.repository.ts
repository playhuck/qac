import { Injectable } from "@nestjs/common";
import { Repository, DataSource, EntityManager } from "typeorm";

import { UserEntity } from "@entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSignUpDto } from "@dtos/users/post.sign.up.dto";
import { AdminEntity } from "@entities/admin.entity";

@Injectable()
export class AdminRepository {

    constructor(
        @InjectRepository(AdminEntity) private adminRepo: Repository<AdminEntity>
    ) {
    };

    async getAdminByEmail(
        email: string
    ){

        const user = await this.adminRepo.findOne({
            where: {
                email
            }
        });

        return user
    };

    async getAdminById(
        adminId: number
    ){

        const user = await this.adminRepo.findOne({
            where: {
                adminId
            }
        });

        return user;
    };

    async insertAdminEntity(
        entityManager: EntityManager,
        body: PostSignUpDto,
        hash: string,
        currTime: string
    ){

        const {
            email,
            name
         } = body;

        const insert = await entityManager.insert(AdminEntity, {
            email,
            name,
            password: hash,
            createdAt: currTime
        });

        return insert;
    };

}