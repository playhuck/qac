import { TNODE_ENV } from '@models/types/t.node.env';
import { Algorithm } from 'jsonwebtoken';

export interface IConfig {
    PORT: number;

    JWT: IJWT_ENV;
};

export interface IJWT_ENV {
    JWT_SECRET_KEY: string;
    JWT_ALGORITHM: Algorithm;
    JWT_ACCESS_EXPIRED_IN: string;
    JWT_PUBLIC_PEM_KEY: string;
    JWT_PRIVATE_PEM_KEY: string;
    JWT_PASSPHRASE: string;
}