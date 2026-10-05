import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFiles, Res, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { MilitiaService } from './militia.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupabaseService } from './supabase.service.js';
import * as _archiver from 'archiver';
const archiver = _archiver as any;

@UseGuards(AuthGuard, RolesGuard)
@Controller('api/militia')
export class MilitiaController {
  constructor(
    private readonly militiaService: MilitiaService,
    private readonly supabaseService: SupabaseService
  ) {}

  @Post('upload')
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: memoryStorage()
  }))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const uploadedUrls = [];
    for (const file of files) {
      const url = await this.supabaseService.uploadFile(file);
      uploadedUrls.push(url);
    }
    return uploadedUrls;
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() createMilitiaDto: any) {
    try {
      if (createMilitiaDto.dateOfBirth) {
        createMilitiaDto.dateOfBirth = new Date(createMilitiaDto.dateOfBirth);
      }
      if (createMilitiaDto.joinedDate) {
        createMilitiaDto.joinedDate = new Date(createMilitiaDto.joinedDate);
      }
      return await this.militiaService.create(createMilitiaDto);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new HttpException('Số CCCD đã tồn tại trong hệ thống!', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(`Lỗi máy chủ: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  // Mọi tài khoản đăng nhập (STAFF, ADMIN, SUPER_ADMIN) đều được xem danh sách
  findAll(
    @Query('search') search?: string,
    @Query('classification') classification?: any
  ) {
    return this.militiaService.findAll(search, classification);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.militiaService.findOne(+id);
  }

  @Get(':id/download-zip')
  async downloadZip(@Param('id') id: string, @Res() res: any) {
    const record = await this.militiaService.findOne(+id);
    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ');
    }

    let attachmentsMap: Record<string, string[]> = {};
    if (Array.isArray(record.attachments)) {
      attachmentsMap['khac'] = record.attachments as any;
    } else if (record.attachments && typeof record.attachments === 'object') {
      attachmentsMap = record.attachments as Record<string, string[]>;
    }

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="HoSo_${record.fullName.replace(/\s+/g, '_')}_${record.nationalId}.zip"`
    });

    archive.pipe(res);

    for (const [category, urls] of Object.entries(attachmentsMap)) {
      for (const url of urls) {
        if (url.startsWith('http')) {
          // Cloud Supabase File
          try {
            const fetchRes = await fetch(url);
            if (fetchRes.ok) {
              const arrayBuffer = await fetchRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const fileName = url.split('/').pop()?.split('?')[0] || 'file';
              archive.append(buffer, { name: `${category}/${fileName}` });
            }
          } catch (e) {
            console.error('Cannot download file for ZIP:', url);
          }
        }
      }
    }

    await archive.finalize();
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateMilitiaDto: any) {
    try {
      if (updateMilitiaDto.dateOfBirth) {
        updateMilitiaDto.dateOfBirth = new Date(updateMilitiaDto.dateOfBirth as string);
      }
      if (updateMilitiaDto.joinedDate) {
        updateMilitiaDto.joinedDate = new Date(updateMilitiaDto.joinedDate as string);
      }
      return await this.militiaService.update(+id, updateMilitiaDto);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new HttpException('Số CCCD đã tồn tại trong hệ thống!', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(`Lỗi máy chủ: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.militiaService.remove(+id);
  }
}
