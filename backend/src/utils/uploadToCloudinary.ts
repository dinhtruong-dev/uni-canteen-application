import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';
import type { UploadApiResponse } from 'cloudinary';

export const uploadToCloudinary = (
    buffer: Buffer,
    folder: string = 'uni-canteen'
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('Cloudinary trả về kết quả rỗng'));
                resolve(result);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};