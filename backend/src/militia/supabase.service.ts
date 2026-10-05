import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ Supabase URL or Key is missing. File uploads will fail on Cloud.');
      // Initialize with dummy values so it doesn't crash on startup, but will fail when used
      this.supabase = createClient('https://dummy.supabase.co', 'dummy');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucketName = 'ho-so-dan-quan';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${uniqueSuffix}-${file.originalname}`;
    
    const { data, error } = await this.supabase
      .storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Supabase Upload Error:', error);
      throw new InternalServerErrorException('Lỗi tải file lên Supabase: ' + error.message);
    }

    // Get public URL
    const { data: publicUrlData } = this.supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }
}
