
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { JwtProvider } from '@providers/jwt.provider';

import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { CustomException } from '@common/exception/custom.exception';
import { ECustomExceptionCode } from '@models/enums/e.exception.code';

@Injectable()
export class KeyAdminGuard implements CanActivate {
    constructor(
        private readonly config: ConfigService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request: Request = await context.switchToHttp().getRequest();
        console.log(request.headers.apikey);
        console.log(this.config.get<string>('API_KEY'));
        
        
        if (request.headers.apikey === this.config.get<string>('API_KEY')) {
            return true
        } else {

            throw new CustomException(
                "유효하지 않은 요청",
                ECustomExceptionCode['UNKNOWN-SERVER-ERROR'],
                401
            )
        };

    };


}