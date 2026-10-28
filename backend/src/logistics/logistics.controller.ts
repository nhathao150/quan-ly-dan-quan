import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthGuard } from '../auth/auth.guard.js';

@UseGuards(AuthGuard)
@Controller('api')
export class LogisticsController {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== PHÂN QUYỀN TÀI KHOẢN (ROLES) ====================
  @Get('roles/me')
  async getMyRole(
    @Query('email') email?: string,
    @Query('fullName') fullName?: string
  ) {
    if (!email) {
      return { email: '', role: 'SUPER_ADMIN' };
    }
    const cleanEmail = email.trim().toLowerCase();

    const existing = await this.prisma.userRoleConfig.findUnique({
      where: { email: cleanEmail }
    });

    if (existing) {
      return existing;
    }

    // Nếu hệ thống chưa có SUPER_ADMIN nào, tự động cấp quyền SUPER_ADMIN cho tài khoản đầu tiên đăng nhập
    const superAdminCount = await this.prisma.userRoleConfig.count({
      where: { role: 'SUPER_ADMIN' }
    });

    if (superAdminCount === 0) {
      return this.prisma.userRoleConfig.create({
        data: {
          email: cleanEmail,
          fullName: fullName || 'Admin Tổng',
          role: 'SUPER_ADMIN',
          note: 'Tài khoản Quản trị viên cao nhất (Tự động khởi tạo)'
        }
      });
    }

    return {
      email: cleanEmail,
      fullName: fullName || '',
      role: 'UNASSIGNED'
    };
  }

  @Get('roles')
  async getAllRoles() {
    return this.prisma.userRoleConfig.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  @Post('roles')
  async upsertRole(@Body() body: { email: string; fullName?: string; role: string; note?: string }) {
    const cleanEmail = body.email.trim().toLowerCase();
    return this.prisma.userRoleConfig.upsert({
      where: { email: cleanEmail },
      update: {
        fullName: body.fullName,
        role: body.role,
        note: body.note,
        updatedAt: new Date()
      },
      create: {
        email: cleanEmail,
        fullName: body.fullName,
        role: body.role,
        note: body.note
      }
    });
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    return this.prisma.userRoleConfig.delete({
      where: { id: +id }
    });
  }

  // ==================== 1. KHO QUÂN TRANG & VẬT CHẤT ====================
  @Get('logistics/inventory')
  async getInventory(@Query('search') search?: string, @Query('category') category?: string) {
    const where: any = {};
    if (search) {
      where.itemName = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      where.category = category;
    }
    return this.prisma.logisticsInventory.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('logistics/inventory')
  async createInventory(@Body() body: any) {
    return this.prisma.logisticsInventory.create({
      data: {
        itemName: body.itemName,
        category: body.category || 'Quân trang',
        quantity: Number(body.quantity) || 0,
        unit: body.unit || 'Cái',
        condition: body.condition || 'Tốt',
        note: body.note || ''
      }
    });
  }

  @Patch('logistics/inventory/:id')
  async updateInventory(@Param('id') id: string, @Body() body: any) {
    return this.prisma.logisticsInventory.update({
      where: { id: +id },
      data: {
        itemName: body.itemName,
        category: body.category,
        quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
        unit: body.unit,
        condition: body.condition,
        note: body.note,
        updatedAt: new Date()
      }
    });
  }

  @Delete('logistics/inventory/:id')
  async deleteInventory(@Param('id') id: string) {
    return this.prisma.logisticsInventory.delete({
      where: { id: +id }
    });
  }

  // ==================== 2. CẤP PHÁT & THU HỒI QUÂN TRANG ====================
  @Get('logistics/distribution')
  async getDistribution(@Query('search') search?: string, @Query('status') status?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) {
      where.status = status;
    }
    return this.prisma.logisticsDistribution.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('logistics/distribution')
  async createDistribution(@Body() body: any) {
    return this.prisma.logisticsDistribution.create({
      data: {
        itemName: body.itemName,
        recipientName: body.recipientName,
        recipientUnit: body.recipientUnit || '',
        quantity: Number(body.quantity) || 1,
        issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
        status: body.status || 'ISSUED',
        note: body.note || ''
      }
    });
  }

  @Patch('logistics/distribution/:id')
  async updateDistribution(@Param('id') id: string, @Body() body: any) {
    return this.prisma.logisticsDistribution.update({
      where: { id: +id },
      data: {
        status: body.status,
        returnDate: body.status === 'RETURNED' ? new Date() : null,
        note: body.note,
        updatedAt: new Date()
      }
    });
  }

  @Delete('logistics/distribution/:id')
  async deleteDistribution(@Param('id') id: string) {
    return this.prisma.logisticsDistribution.delete({
      where: { id: +id }
    });
  }

  // ==================== 3. KINH PHÍ / ĂN UỐNG / CHẾ ĐỘ TRỰC ====================
  @Get('logistics/finance')
  async getFinance(@Query('type') type?: string) {
    const where: any = {};
    if (type) {
      where.type = type;
    }
    return this.prisma.logisticsFinance.findMany({
      where,
      orderBy: { recordDate: 'desc' }
    });
  }

  @Post('logistics/finance')
  async createFinance(@Body() body: any) {
    return this.prisma.logisticsFinance.create({
      data: {
        title: body.title,
        type: body.type || 'CHI_AN',
        amount: Number(body.amount) || 0,
        recordDate: body.recordDate ? new Date(body.recordDate) : new Date(),
        personInCharge: body.personInCharge || '',
        note: body.note || ''
      }
    });
  }

  @Delete('logistics/finance/:id')
  async deleteFinance(@Param('id') id: string) {
    return this.prisma.logisticsFinance.delete({
      where: { id: +id }
    });
  }

  // ==================== 4. HỒ SƠ & CHỨNG TỪ HẬU CẦN ====================
  @Get('logistics/documents')
  async getDocuments() {
    return this.prisma.logisticsDocument.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  @Post('logistics/documents')
  async createDocument(@Body() body: any) {
    return this.prisma.logisticsDocument.create({
      data: {
        title: body.title,
        period: body.period || '',
        note: body.note || '',
        attachments: body.attachments || {}
      }
    });
  }

  @Delete('logistics/documents/:id')
  async deleteDocument(@Param('id') id: string) {
    return this.prisma.logisticsDocument.delete({
      where: { id: +id }
    });
  }

  // ==================== 5. NHẮC NHỞ CÔNG VIỆC & TIẾN ĐỘ (PHÂN QUYỀN TÁCH BIỆT) ====================
  private async resolveCallerRole(email?: string): Promise<string> {
    if (!email) return 'SUPER_ADMIN';
    const cleanEmail = email.trim().toLowerCase();
    const found = await this.prisma.userRoleConfig.findUnique({
      where: { email: cleanEmail }
    });
    return found?.role || 'SUPER_ADMIN';
  }

  @Get('tasks')
  async getTasks(
    @Query('email') email?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    const callerRole = await this.resolveCallerRole(email);
    const where: any = {};

    // Cô lập tuyệt đối công việc giữa 2 Chỉ huy
    if (callerRole === 'DAN_QUAN') {
      where.department = 'DAN_QUAN';
    } else if (callerRole === 'HAU_CAN') {
      where.department = 'HAU_CAN';
    } else if (department) {
      where.department = department;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { assigneeName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    return this.prisma.workTask.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });
  }

  @Post('tasks')
  async createTask(@Body() body: any) {
    const callerRole = await this.resolveCallerRole(body.callerEmail);

    // Nếu là Chỉ huy Dân quân hoặc Hậu cần thì bắt buộc lưu vào đúng ban của mình
    let finalDept = body.department || 'DAN_QUAN';
    if (callerRole === 'DAN_QUAN') finalDept = 'DAN_QUAN';
    if (callerRole === 'HAU_CAN') finalDept = 'HAU_CAN';

    const progress = Number(body.progress) || 0;
    const status = progress >= 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : body.status || 'PENDING';

    return this.prisma.workTask.create({
      data: {
        title: body.title,
        description: body.description || '',
        department: finalDept,
        assigneeName: body.assigneeName,
        assignedBy: body.assignedBy || '',
        priority: body.priority || 'MEDIUM',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        progress,
        status
      }
    });
  }

  @Patch('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() body: any) {
    const data: any = { updatedAt: new Date() };

    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.assigneeName !== undefined) data.assigneeName = body.assigneeName;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    if (body.progress !== undefined) {
      const p = Math.min(100, Math.max(0, Number(body.progress)));
      data.progress = p;
      if (p === 100) data.status = 'COMPLETED';
      else if (p > 0) data.status = 'IN_PROGRESS';
      else data.status = 'PENDING';
    }

    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === 'COMPLETED') data.progress = 100;
      else if (body.status === 'PENDING' && body.progress === undefined) data.progress = 0;
    }

    return this.prisma.workTask.update({
      where: { id: +id },
      data
    });
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    return this.prisma.workTask.delete({
      where: { id: +id }
    });
  }
}
