import dotenv from 'dotenv';
import { Options } from 'sequelize';

dotenv.config();

const config = {
    db: {
        dialect: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        logging: false,
        timezone: '+07:00',
    } as Options,
};

export default config;