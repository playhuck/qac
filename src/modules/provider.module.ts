import { UserEntity } from '@entities/user.entity';
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BcryptProvider } from '@providers/bcrypt.provider';
import { DayjsProvider } from '@providers/dayjs.provider';
import { JwtProvider } from '@providers/jwt.provider';
import { RandomProvider } from '@providers/random.provider';

import { UserRepository } from '@repositories/user.repository';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity
        ])
    ],
    providers: [
    
        BcryptProvider,
        JwtProvider,
        DayjsProvider,
        RandomProvider,

        UserRepository
    ],
    exports: [

        BcryptProvider,
        JwtProvider,
        DayjsProvider,
        RandomProvider,

        UserRepository

    ]
})
export class ProvidersModule { }