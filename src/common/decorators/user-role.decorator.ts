import { SetMetadata } from '@nestjs/common';

export enum Role {
  primaryuser = 'primaryuser',
  admin = 'admin',
}

export const ROLES_KEY = 'roles';
export const AllowedRoles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
