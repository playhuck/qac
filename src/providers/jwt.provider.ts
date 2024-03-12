import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { CustomTokenType } from 'jsonwebtoken';

import { CustomException } from '@common/exception/custom.exception';

import { ECustomExceptionCode } from '@models/enums/e.exception.code';
import { IJWT_ENV } from '@models/interfaces/i.config';

declare module "jsonwebtoken" {
    export type CustomTokenType = "AccessToken" | "RefreshToken" | "CursorToken";

    export interface ICustomPayload extends jwt.JwtPayload {
        type: CustomTokenType;
    }

    export interface IAccessTokenPayload extends ICustomPayload {
        type: CustomTokenType;
        userId?: number;
        adminId?: number;
    }

    export interface IRefreshTokenPayload extends ICustomPayload {
        type: "RefreshToken";
        userId: number;
    }

    export interface ICursorPayload extends ICustomPayload {
        type: "CursorToken",
        cursorId: number
    }

};

@Injectable()
export class JwtProvider {

    private readonly JWT_ENV: IJWT_ENV

    constructor(
        private readonly config: ConfigService
    ) {
        this.JWT_ENV = this.config.get<IJWT_ENV>('JWT')!
    }


    public signAccessToken(payload: jwt.IAccessTokenPayload): string {

        const {
            JWT_ACCESS_EXPIRED_IN,
            JWT_ALGORITHM,
            JWT_PRIVATE_PEM_KEY,
            JWT_PASSPHRASE
        } = this.JWT_ENV;

        return jwt.sign(
            payload,
            {
                key: JWT_PRIVATE_PEM_KEY,
                passphrase: JWT_PASSPHRASE
            },
            {
                expiresIn: JWT_ACCESS_EXPIRED_IN,
                algorithm: JWT_ALGORITHM
            }
        )
    };

    public signCursorAccessToken(payload: jwt.ICursorPayload): string {

        return jwt.sign(
            payload, this.config.get<string>('CURSOR_KEY')!, {
            expiresIn: '1d',
            algorithm: 'HS256'
        })
    };

    public signExpiredToken(payload: jwt.IRefreshTokenPayload): string {

        const {
            JWT_ALGORITHM,
            JWT_PRIVATE_PEM_KEY,
            JWT_PASSPHRASE
        } = this.JWT_ENV;

        return jwt.sign(
            payload,
            {
                key: JWT_PRIVATE_PEM_KEY,
                passphrase: JWT_PASSPHRASE,
            },
            {
                expiresIn: '-1h',
                algorithm: JWT_ALGORITHM,
            },
        );

    }

    public extractToken(bearerToken: string): string {
        return bearerToken.substring(7);
    }

    public verifyToken<T extends jwt.IAccessTokenPayload>(token: string): T {

        const {
            JWT_PUBLIC_PEM_KEY,
            JWT_ALGORITHM
        } = this.JWT_ENV;
        try {
            return <T>jwt.verify(token, JWT_PUBLIC_PEM_KEY, {
                algorithms: [JWT_ALGORITHM],
            });

        } catch (err) {

            throw new CustomException(
                '토큰 검증 실패',
                ECustomExceptionCode['JWT-002'],
                401
            );
        }
    };

    public verifyCursorToken<T extends jwt.ICursorPayload>(token: string): T {

        try {
            return <T>jwt.verify(token, this.config.get<string>('CURSOR_KEY')!, {
                algorithms: ['HS256'],
            });

        } catch (err) {

            throw new CustomException(
                '토큰 검증 실패',
                ECustomExceptionCode['JWT-002'],
                401
            );
        }
    };

    public verifyExp(
        token: jwt.ICustomPayload,
        type: CustomTokenType
    ) {

        const timeDiffSec = this.getTimeDiffSec(token);

        if (type === 'AccessToken') {
            return timeDiffSec <= 3540 ? false : true
        } else {
            return timeDiffSec <= 2524740 ? false : true
        }
    };

    private getTimeDiffSec(token: jwt.ICustomPayload) {
        const expirationTimeInSeconds = token.exp!;
        const expirationDate = new Date(expirationTimeInSeconds * 1000);

        const currentTime = new Date();
        const timeDiffSec = Math.floor((expirationDate.getTime() - currentTime.getTime()) / 1000);

        return timeDiffSec
    }

}