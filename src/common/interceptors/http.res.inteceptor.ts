import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {

    constructor() {};

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                if (data) {
                    const res = context.switchToHttp().getResponse();

                    if ('tokens' in data) {
                        const { tokens, ...datas } = data;
                        
                        const bearerToken = `Bearer ${tokens}`;
                        res.header('Authorization', bearerToken);

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