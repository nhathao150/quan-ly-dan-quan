import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class MilitiaService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.MilitiaRecordCreateInput) {
    return this.prisma.militiaRecord.create({
      data,
    });
  }

  async findAll(search?: string, classification?: any) {
    const where: Prisma.MilitiaRecordWhereInput = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search } }
      ];
    }
    
    if (classification) {
      where.classification = classification;
    }

    return this.prisma.militiaRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number) {
    const record = await this.prisma.militiaRecord.findUnique({
      where: { id },
      include: {
        trainingHistories: true,
        equipments: true,
      }
    });

    if (!record) {
      throw new NotFoundException('Không tìm thấy hồ sơ dân quân này');
    }

    return record;
  }

  async update(id: number, data: Prisma.MilitiaRecordUpdateInput) {
    // Kiểm tra xem có tồn tại không
    await this.findOne(id);
    
    return this.prisma.militiaRecord.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.militiaRecord.delete({
      where: { id },
    });
  }
}
