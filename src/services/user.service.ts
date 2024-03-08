import { Injectable } from '@nestjs/common';

import { CustomException } from '@common/exception/custom.exception';
import { ECustomExceptionCode } from '@models/enums/e.exception.code';
import { DataSource, EntityManager } from 'typeorm';
import { BcryptProvider } from '@providers/bcrypt.provider';
import { UserEntity } from '@entities/user.entity';
import { UserRepository } from '@repositories/user.repository';

@Injectable()
export class UserService {

    constructor(
        private readonly userRepo: UserRepository
    ){}

    async hello(){

        await this.userRepo.insertUser();

    };

    async getUser(){

        const user = await this.userRepo.getUser();

        return user
    }
}
