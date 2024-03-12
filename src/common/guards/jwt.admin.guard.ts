
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtProvider } from '@providers/jwt.provider';
import { CustomException } from '@common/exception/custom.exception';

import {
    ECustomExceptionCode
} from '@models/enums/e.exception.code';
import { DataSource } from 'typeorm';
import { AdminEntity } from '@entities/admin.entity';

@Injectable()
export class JwtAdminGuard implements CanActivate {
    constructor(
        private jwt: JwtProvider,
        private dataSource: DataSource
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = await context.switchToHttp().getRequest();
        const response: Response = await context.switchToHttp().getResponse();

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new CustomException(
                'JWT 토큰이 누락되었습니다.',
                ECustomExceptionCode['JWT-001'],
                401
            );
        }

        const payload = this.jwt.verifyToken(token);
        if (payload['type'] !== 'AccessToken') {
            throw new CustomException(
                "ACCESS 토큰타입이 아닙니다.",
                ECustomExceptionCode["JWT-002"],
                401
            )
        };

        const isAdmin = await this.dataSource.manager.query(
            `SELECT admin_id as adminId FROM admin WHERE admin_id = ?`, [payload['adminId']]
        )
        
        if (isAdmin.length !== 1) {
            throw new CustomException(
                "관리자 계정이 아님",
                ECustomExceptionCode['ADMIN-001'],
                401
            )
        };

        response['adminId'] = isAdmin[0].adminId

        return true;
    };

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

}