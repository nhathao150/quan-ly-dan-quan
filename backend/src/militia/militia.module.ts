import { Module } from '@nestjs/common';
import { MilitiaService } from './militia.service.js';
import { SupabaseService } from './supabase.service.js';
import { MilitiaController } from './militia.controller.js';

@Module({
  controllers: [MilitiaController],
  providers: [MilitiaService, SupabaseService],
})
export class MilitiaModule {}
