declare const _default: () => {
    port: number;
    apiPrefix: string;
    nodeEnv: string;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    cors: {
        origins: string[];
    };
    pgAdmin: {
        email: string;
        password: string;
        port: string;
    };
};
export default _default;
