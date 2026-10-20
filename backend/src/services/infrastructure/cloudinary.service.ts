export class CloudinaryService {
  private cloudName: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'unieat-campus';
  }

  public async uploadImage(
    imageData: string,
    folder: string = 'foods'
  ): Promise<{
    url: string;
    secureUrl: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
  }> {
    const publicId = `${folder}/${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      const optimizedUrl = `https://res.cloudinary.com/${this.cloudName}/image/fetch/f_auto,q_auto,w_800/${encodeURIComponent(imageData)}`;
      return {
        url: optimizedUrl,
        secureUrl: optimizedUrl,
        publicId,
        format: 'webp',
        width: 800,
        height: 600,
      };
    }

    // If Base64 image
    const secureUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/f_auto,q_auto,w_800/${publicId}.webp`;

    return {
      url: secureUrl,
      secureUrl,
      publicId,
      format: 'webp',
      width: 800,
      height: 600,
    };
  }
}

export const cloudinaryService = new CloudinaryService();
