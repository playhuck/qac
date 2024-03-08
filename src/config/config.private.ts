import fs from 'fs';
import path from 'path';
import { Algorithm } from 'jsonwebtoken';

import { TNODE_ENV } from "@models/types/t.node.env";

export function getEnvStr(KEY: string) {
    const VALUE = process.env[KEY];
    if (VALUE === undefined) throw new Error(`${KEY} 는 undefined 일 수 없습니다.`);

    return VALUE;
}

export function getEnvNum(KEY: string): number {
    const VALUE = process.env[KEY];
    if (VALUE === undefined) throw new Error(`${KEY} 는 undefined 일 수 없습니다.`);

    const NUMBER_VALUE = +VALUE;
    const isNumber = !isNaN(NUMBER_VALUE);
    if (isNumber === false) throw new Error(`${KEY} 는 string 일 수 없습니다.`);

    return NUMBER_VALUE;
}

export function getEnvMode(KEY: string): TNODE_ENV {
    const VALUE = process.env[KEY];
    if (VALUE === undefined) throw new Error(`${KEY} 는 undefined 일 수 없습니다.`);
    if (VALUE !== "dev" && VALUE !== "test" && VALUE !== "prod")
        throw new Error(`${KEY} 는 dev prod test 이여야 합니다.`);

    return VALUE;
};

/** @deprecated */
export function getPemKeyLegacy(KEY: 'private' | 'public'): string {
    const pemKey = fs.readFileSync(path.join(process.cwd(), `${KEY}.pem`), "utf8");

    return pemKey;
};

export function getPemKey(KEY: string): string {
    const pemKey = fs.readFileSync(path.join(process.cwd(), `${KEY}.pem`), "utf8");

    return pemKey;
}

export function getEnvLiteralTypeValue<T extends Algorithm[]>(KEY: string) {
    const VALUE = process.env[KEY];
    if (VALUE === undefined) throw new Error(`${KEY} 는 undefined 일 수 없습니다.`);

    const VALUE_TARGETS: Algorithm[] = [
        "HS256",
        "HS384",
        "HS512",
        "RS256",
        "RS384",
        "RS512",
        "ES256",
        "ES384",
        "ES512",
        "PS256",
        "PS384",
        "PS512",
    ];
    const TYPED_VALUE = VALUE_TARGETS.find((v) => v === VALUE);
    if (TYPED_VALUE === undefined) throw new Error(`${KEY} 는 리터럴 타입이어야 합니다. 오탈자를 확인해주세요.`);

    return TYPED_VALUE;
}