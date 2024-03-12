import { ECustomExceptionCode } from "@models/enums/e.exception.code";

export interface IErrorResponse {
    data: {
        errorType: string;
        errorCode: ECustomExceptionCode;
    }
    code: number;
    message: string;
}