import { Injectable } from '@nestjs/common';

import { CustomException } from '@common/exception/custom.exception';
import { ECustomExceptionCode } from '@models/enums/e.exception.code';
import { BcryptProvider } from '@providers/bcrypt.provider';
import { DbUtils } from '@utils/db.utils';
import { JwtProvider } from '@providers/jwt.provider';
import { DayjsProvider } from '@providers/dayjs.provider';
import { AdminRepository } from '@repositories/admin.repository';
import { PostAdminSignUpDto } from '@dtos/admin/post.sign.up.dto';
import { PostAdminSignInDto } from '@dtos/admin/post.sign.in.dto';

@Injectable()
export class AdminService {

    constructor(
        private readonly db: DbUtils,

        private readonly bcrypt: BcryptProvider,
        private readonly jwt: JwtProvider,
        private readonly dyajs: DayjsProvider,

        private readonly adminRepo: AdminRepository
    ) { }

    async signUp(
        body: PostAdminSignUpDto
    ) {

        void await this.db.transaction(
            async (entityManager, args) => {

                const {
                    email,
                    password,
                    passwordCheck
                } = args.body;
                const currTime = this.dyajs.nowUtc;

                const getUser = await this.adminRepo.getAdminByEmail(email);
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

                const insertAdminEntity = await this.adminRepo.insertAdminEntity(
                    entityManager,
                    body,
                    hashedPassword,
                    currTime
                );
                if (insertAdminEntity.generatedMaps.length !== 1) {
                    throw new CustomException(
                        "UNKNOWN-SERVER-ERROR",
                        ECustomExceptionCode["AWS-RDS-EXCEPTION"],
                        500
                    )
                };

            }, { body })

    };

    async signIn(
        body: PostAdminSignInDto
    ) {

        const { email, password } = body;

        const admin = await this.adminRepo.getAdminByEmail(email);
        if (!admin) {
            throw new CustomException(
                "존재하지 않는 유저입니다.",
                ECustomExceptionCode['USER-002'],
                401
            );
        };

        const compared = await this.bcrypt.comparedPassword(
            password,
            admin.password
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
            adminId: admin.adminId
        });

        return accessToken;

    };

};
