import { DomainException } from '../common/errors/domain.exception';

export const merchantsErrors = {
  merchantNotFound: () =>
    new DomainException(404, 'MERCHANT_NOT_FOUND', 'La cafetería no existe'),
  roleNotAssignable: () =>
    new DomainException(
      400,
      'MERCHANT_ROLE_NOT_ASSIGNABLE',
      'El rol OWNER no se asigna desde esta ruta: la propiedad se transfiere con otra operación',
    ),
  lastOwnerProtected: () =>
    new DomainException(
      409,
      'LAST_OWNER_PROTECTED',
      'El comercio no puede quedar sin dueño',
    ),
  staffNotFound: () =>
    new DomainException(
      404,
      'MERCHANT_STAFF_NOT_FOUND',
      'El usuario no forma parte del personal de esta cafetería',
    ),
  staffAlreadyExists: () =>
    new DomainException(
      409,
      'MERCHANT_STAFF_ALREADY_EXISTS',
      'El usuario ya forma parte del personal de esta cafetería',
    ),
  userNotFound: () =>
    new DomainException(
      404,
      'USER_NOT_FOUND',
      'No existe una cuenta con ese correo',
    ),
};
