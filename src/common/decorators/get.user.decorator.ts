import { ICustomResponse } from '@models/interfaces/i.custom.res';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const response : ICustomResponse = ctx.switchToHttp().getResponse();
        return response["userId"];
    },
);