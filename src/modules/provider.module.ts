import { AdminEntity } from '@entities/admin.entity';
import { QuestionEntity } from '@entities/question.entity';
import { QuestionMidEntity } from '@entities/question.mid.entity';
import { QuestionUserListEntity } from '@entities/question.user.list.entity';
import { UserEntity } from '@entities/user.entity';
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BcryptProvider } from '@providers/bcrypt.provider';
import { DayjsProvider } from '@providers/dayjs.provider';
import { JwtProvider } from '@providers/jwt.provider';
import { RandomProvider } from '@providers/random.provider';
import { AdminRepository } from '@repositories/admin.repository';
import { QuestionRepository } from '@repositories/question.repository';

import { UserRepository } from '@repositories/user.repository';
import { DbUtils } from '@utils/db.utils';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            QuestionEntity,
            QuestionUserListEntity,
            QuestionMidEntity,
            AdminEntity
        ])
    ],
    providers: [

        DbUtils,
    
        BcryptProvider,
        JwtProvider,
        DayjsProvider,
        RandomProvider,

        UserRepository,
        AdminRepository,
        QuestionRepository
    ],
    exports: [
        
        DbUtils,

        BcryptProvider,
        JwtProvider,
        DayjsProvider,
        RandomProvider,

        UserRepository,
        AdminRepository,
        QuestionRepository

    ]
})
export class ProvidersModule { }