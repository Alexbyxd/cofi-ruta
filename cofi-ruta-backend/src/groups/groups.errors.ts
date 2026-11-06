import { DomainException } from '../common/errors/domain.exception';

export const groupErrors = {
  notFound: () =>
    new DomainException(404, 'GROUP_NOT_FOUND', 'El grupo no existe'),
  forbidden: () =>
    new DomainException(
      403,
      'GROUP_FORBIDDEN',
      'No tienes acceso a este grupo',
    ),
  closed: () =>
    new DomainException(409, 'GROUP_CLOSED', 'El grupo ya está cerrado'),
  expired: () => new DomainException(410, 'GROUP_EXPIRED', 'El grupo expiró'),
  full: () =>
    new DomainException(409, 'GROUP_FULL', 'El grupo alcanzó su límite'),
  alreadyMember: () =>
    new DomainException(
      409,
      'GROUP_ALREADY_MEMBER',
      'Ya eres miembro de este grupo',
    ),
  codeUnavailable: () =>
    new DomainException(
      503,
      'GROUP_CODE_UNAVAILABLE',
      'No se pudo generar un código único para el grupo',
    ),
  tokenWrongType: () =>
    new DomainException(
      400,
      'PAIRING_TOKEN_WRONG_TYPE',
      'El token de emparejamiento no es de tipo GROUP',
    ),
};
