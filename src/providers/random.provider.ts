import { Injectable } from "@nestjs/common";

@Injectable()
export class RandomProvider {

    async generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            result += chars.charAt(randomIndex);
        }

        return result;
    };

    async getRandomValueFromArray(array: any) {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }

}