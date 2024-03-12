import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { IErrorResponse } from '@models/interfaces/i.error';
import { CustomException } from './custom.exception';
import { ECustomExceptionCode } from '@models/enums/e.exception.code';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

    constructor() {

    };

    catch(exception: unknown, host: ArgumentsHost): void | CustomException {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response
            .status(this.statusCode(exception))
            .json({
                isSuccess: false,
                ...this.errorResponse(exception)
            });

    }

    private statusCode(exception: unknown): number {
        if (exception instanceof CustomException) {
            return exception?.statusCode ?? HttpStatus.BAD_REQUEST;
        }

        if (exception instanceof HttpException) {
            return exception.getStatus();
        }

        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private errorResponse(exception: unknown): IErrorResponse {
        const errResponse = exception?.['response'];
        console.log(exception);
        
        const message = exception?.['name'] === 'QueryFailedError' ?
            ECustomExceptionCode['AWS-RDS-EXCEPTION'] :
            errResponse?.['errorMessage'] ?? exception?.['message']

        if (exception instanceof CustomException) {
            return {
                code: 1,
                data: {
                    errorType: exception?.['name'],
                    errorCode: errResponse?.['errorCode'] ?? exception?.['errorCode']
                },
                message
            }
        }

        return {
            code: 1,
            data: {
                errorType: exception?.['name'],
                errorCode: errResponse?.['errorCode'] ?? exception?.['errorCode']
            },
            message
        }
    }
}