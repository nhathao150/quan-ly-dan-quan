import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private static synced = false;

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Đã kết nối thành công tới Supabase PostgreSQL!');

      if (!PrismaService.synced) {
        PrismaService.synced = true;
        // Chạy đồng bộ cấu trúc bảng bất đồng bộ để không làm chậm Serverless Cold Start trên Vercel
        this.syncSchemaInBackground().catch((err) => {
          console.warn('⚠️ Bỏ qua đồng bộ DDL phụ:', err?.message);
        });
      }
    } catch (error: any) {
      console.error('⚠️ Không thể kết nối tới Supabase PostgreSQL:', error.message);
    }
  }

  private async syncSchemaInBackground() {
    await this.$executeRawUnsafe(
      `ALTER TABLE "MilitiaRecord" ADD COLUMN IF NOT EXISTS "militiaType" TEXT, ADD COLUMN IF NOT EXISTS "militiaUnit" TEXT;`
    );
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UserRoleConfig" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "fullName" TEXT,
        "role" TEXT NOT NULL DEFAULT 'DAN_QUAN',
        "note" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LogisticsInventory" (
        "id" SERIAL PRIMARY KEY,
        "itemName" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'Quân trang',
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "unit" TEXT NOT NULL DEFAULT 'Cái',
        "condition" TEXT NOT NULL DEFAULT 'Tốt',
        "note" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LogisticsDistribution" (
        "id" SERIAL PRIMARY KEY,
        "itemName" TEXT NOT NULL,
        "recipientName" TEXT NOT NULL,
        "recipientUnit" TEXT,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "returnDate" TIMESTAMP(3),
        "status" TEXT NOT NULL DEFAULT 'ISSUED',
        "note" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LogisticsFinance" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'CHI_AN',
        "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "personInCharge" TEXT,
        "note" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LogisticsDocument" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "period" TEXT,
        "note" TEXT,
        "attachments" JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await this.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "WorkTask" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "department" TEXT NOT NULL DEFAULT 'DAN_QUAN',
        "assigneeName" TEXT NOT NULL,
        "assignedBy" TEXT,
        "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
        "dueDate" TIMESTAMP(3),
        "progress" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}
