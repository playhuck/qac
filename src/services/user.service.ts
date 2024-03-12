import { Injectable } from '@nestjs/common';

import { CustomException } from '@common/exception/custom.exception';
import { ECustomExceptionCode } from '@models/enums/e.exception.code';
import { EntityManager } from 'typeorm';
import { BcryptProvider } from '@providers/bcrypt.provider';
import { UserRepository } from '@repositories/user.repository';
import { PostSignUpDto } from '@dtos/users/post.sign.up.dto';
import { DbUtils } from '@utils/db.utils';
import { JwtProvider } from '@providers/jwt.provider';
import { PostSignInDto } from '@dtos/users/post.sign.in.dto';
import { PatchUserDto } from '@dtos/users/patch.user.dto';
import { UserParamDto } from '@dtos/users/user.param.dto';
import { DayjsProvider } from '@providers/dayjs.provider';

@Injectable()
export class UserService {

    constructor(
        private readonly db: DbUtils,

        private readonly bcrypt: BcryptProvider,
        private readonly jwt: JwtProvider,
        private readonly dyajs: DayjsProvider,

        private readonly userRepo: UserRepository
    ) { }

    async signUp(
        body: PostSignUpDto
    ) {

        void await this.db.transaction(
            async (entityManager, args) => {

                const {
                    email,
                    password,
                    passwordCheck
                } = args.body;
                const currTime = this.dyajs.nowUtc;

                const getUser = await this.userRepo.getUserByEmail(email);
                if (getUser) {
                    throw new CustomException(
                        "중복된 아이디입니다.",
                        ECustomExceptionCode['USER-001'],
                        400
                    );
                };

                const matched = this.bcrypt.matchedPassword(
                    password,
                    passwordCheck
                );
                if (!matched) {
                    throw new CustomException(
                        "비밀번호가 일치하지 않습니다.",
                        ECustomExceptionCode["INCORECT-PWD"],
                        400
                    );
                };

                const hashedPassword = await this.bcrypt.hashPassword(password);

                const insertUserEntity = await this.userRepo.insertUserEntity(
                    entityManager,
                    body,
                    hashedPassword,
                    currTime
                );
                if (insertUserEntity.generatedMaps.length !== 1) {
                    throw new CustomException(
                        "UNKNOWN-SERVER-ERROR",
                        ECustomExceptionCode["AWS-RDS-EXCEPTION"],
                        500
                    )
                };

            }, { body })

    };

    async signIn(
        body: PostSignInDto
    ) {

        const { email, password } = body;

        const user = await this.userRepo.getUserByEmail(email);
        if (!user) {
            throw new CustomException(
                "존재하지 않는 유저입니다.",
                ECustomExceptionCode['USER-002'],
                401
            );
        };

        const compared = await this.bcrypt.comparedPassword(
            password,
            user.password
        );

        if (!compared) {
            throw new CustomException(
                "비밀번호가 일치하지 않습니다.",
                ECustomExceptionCode['INCORECT-DB-PWD'],
                400
            );
        };

        const accessToken = this.jwt.signAccessToken({
            type: 'AccessToken',
            userId: user.userId
        });

        return accessToken;

    };

    async update(
        param: UserParamDto,
        body: PatchUserDto
    ) {

        void await this.db.transaction(
            async (entityManager: EntityManager, args) => {

                const { body, param } = args;
                const { userId } = param;
                const { name } = body;

                const user = await this.userRepo.getUserById(userId);
                if (!user) {
                    throw new CustomException(
                        "존재하지 않는 유저",
                        ECustomExceptionCode["USER-002"],
                        401
                    )
                };

                const update = await this.userRepo.updateUserName(
                    entityManager,
                    userId,
                    name
                );
                if (update.affected !== 1) {
                    throw new CustomException(
                        "UNKNOWN-SERVER-ERROR",
                        ECustomExceptionCode["AWS-RDS-EXCEPTION"],
                        500
                    )
                }

            }, { body, param })
    };

    async remove(
        param: UserParamDto
    ) {
        void await this.db.transaction(
            async (entityManager: EntityManager, args) => {

                const { param } = args;
                const { userId } = param;

                const user = await this.userRepo.getUserById(userId);
                if (!user) {
                    throw new CustomException(
                        "존재하지 않는 유저",
                        ECustomExceptionCode["USER-002"],
                        401
                    )
                };

                const remove = await this.userRepo.removeUserEntity(
                    entityManager,
                    userId
                );
                if (remove.affected !== 1) {
                    throw new CustomException(
                        "UNKNOWN-SERVER-ERROR",
                        ECustomExceptionCode["AWS-RDS-EXCEPTION"],
                        500
                    )
                }

            }, { param })

    }

};
