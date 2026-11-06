import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'cofi:roles';

/** Exige uno de los roles globales de `User`, típicamente `Role.SUPERADMIN`. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
