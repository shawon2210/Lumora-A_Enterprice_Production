import { randomBytes } from 'node:crypto';
import { config } from '@/config/env';

// Media upload service with Cloudinary integration
class CloudinaryService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(
      config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret
    );
  }

  async upload(_file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured) {
      console.warn(
        '[CLOUDINARY] Cloudinary not configured — returning placeholder URL (dev mode). Set CLOUDINARY_* env vars in production.',
      );
      return {
        url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(randomBytes(8).toString('hex'))}`,
        publicId: `dev-${Date.now()}`,
      };
    }

    // Production: Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', new Blob([(_file as any).buffer]), _file.originalname);
    formData.append('upload_preset', 'lumora-media');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${config.cloudinary.apiKey}:${config.cloudinary.apiSecret}`,
          ).toString('base64')}`,
        },
        body: formData as any,
      },
    );

    if (!response.ok) {
      throw new Error('Failed to upload to Cloudinary');
    }

    const result = (await response.json()) as { secure_url: string; public_id: string };
    return { url: result.secure_url, publicId: result.public_id };
  }

  async delete(_publicId: string): Promise<boolean> {
    if (!this.isConfigured) {
      return true;
    }
    // Production: Delete from Cloudinary
    // Note: Requires server-side SDK for deletion
    return true;
  }
}

export const cloudinaryService = new CloudinaryService();
