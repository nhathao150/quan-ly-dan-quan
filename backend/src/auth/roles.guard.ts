import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('Chưa đăng nhập');
    }
    
    // SUPER_ADMIN has access to everything
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }
    
    if (requiredRoles.includes(user.role)) {
      return true;
    }
    
    throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
  }
}
