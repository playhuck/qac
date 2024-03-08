import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TNODE_ENV } from '@models/types/t.node.env';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {

    constructor() {
        
    };

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                if (data) {
                    const res = context.switchToHttp().getResponse();

                    if ('tokens' in data) {
                        const { tokens, ...datas } = data;
                        if (tokens?.accessToken) {
                            const bearerToken = `Bearer ${tokens.accessToken}`;
                            res.header('Authorization', bearerToken);
                        }

                        if (tokens?.accessToken && tokens?.refreshToken)
                            res.setHeader('Set-Cookie', [
                                `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; Path=/;`,
                            ]);

                        return { isSuccess: true, ...datas };
                    } else {
                        return { isSuccess: true, ...data };
                    }
                } else {
                    return { isSuccess: true };
                };
            })
        );
    }
}