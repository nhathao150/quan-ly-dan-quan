import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
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
      await this.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access ho-so-dan-quan'
          ) THEN
            CREATE POLICY "Public Access ho-so-dan-quan" ON storage.objects FOR ALL USING (bucket_id = 'ho-so-dan-quan') WITH CHECK (bucket_id = 'ho-so-dan-quan');
          END IF;
        END $$;
      `);
      console.log('✅ Đã kết nối và đồng bộ toàn bộ bảng + quyền Storage thành công tới Supabase PostgreSQL!');
    } catch (error: any) {
      console.error('⚠️ Không thể kết nối tới Supabase PostgreSQL:', error.message);
    }
  }
}
