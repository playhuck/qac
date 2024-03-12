import { Injectable } from "@nestjs/common";

@Injectable()
export class CommonUtil {

    public async skipedItem(
        page: number,
        pageCount: number
    ): Promise<number> {
        return (page - 1) * pageCount;
    };

    public isValidateEmail(email: string) {

        const emailRegex = new RegExp(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,4}$/i)

        return emailRegex.test(email);
    }

}