import { IConfig } from "@models/interfaces/i.config";
import { getEnvLiteralTypeValue, getEnvMode, getEnvNum, getEnvStr, getPemKey } from "./config.private";

export default (): IConfig => ({
    PORT: getEnvNum('PORT') || 3000,
    JWT: {
        JWT_SECRET_KEY: getEnvStr('JWT_SECRET_KEY'),
        JWT_ACCESS_EXPIRED_IN: getEnvStr('JWT_ACCESS_EXPIRED_IN'),
        JWT_ALGORITHM: getEnvLiteralTypeValue('JWT_ALGORITHM'),
        JWT_PUBLIC_PEM_KEY: getPemKey('secrets/jwt.public'),
        JWT_PRIVATE_PEM_KEY: getPemKey('secrets/jwt.private'),
        JWT_PASSPHRASE: getEnvStr('JWT_PASSPHRASE')
    }
})