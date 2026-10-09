// src/db/sequelize.ts
import { Sequelize } from 'sequelize-typescript';
import { Options } from 'sequelize';
import config from '../config';
import * as AllModels from '../models/allModels';

const sequelize = new Sequelize({
    ...(config.db as Options),
    models: Object.values(AllModels),
    define: {
        timestamps: true,
        underscored: true,
        charset: 'utf8mb4',
    },
});

export async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Đã kết nối MySQL qua Sequelize-TypeScript!');
        await sequelize.sync({ alter: true });
        console.log('Đã đồng bộ cấu trúc Model xuống Database!');
    } catch (error) {
        console.error('Lỗi kết nối Database:', error);
    }
}

export { sequelize };
export default sequelize;