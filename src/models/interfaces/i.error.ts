import { ECustomExceptionCode } from "@models/enums/e.exception.code";

export interface IErrorResponse {
    data: {
        errorType: string;
    }
    code: ECustomExceptionCode;
    message: string;
}