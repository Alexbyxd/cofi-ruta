import { DomainException } from '../common/errors/domain.exception';

export const pairingErrors = {
  tokenNotFound: () =>
    new DomainException(
      404,
      'PAIRING_TOKEN_NOT_FOUND',
      'El token de emparejamiento no existe',
    ),
  tokenAlreadyUsed: () =>
    new DomainException(
      409,
      'PAIRING_TOKEN_ALREADY_USED',
      'El token de emparejamiento ya fue utilizado',
    ),
  tokenRevoked: () =>
    new DomainException(
      409,
      'PAIRING_TOKEN_REVOKED',
      'El token de emparejamiento fue revocado',
    ),
  tokenExpired: () =>
    new DomainException(
      410,
      'PAIRING_TOKEN_EXPIRED',
      'El token de emparejamiento expiró',
    ),
  cannotPairWithSelf: () =>
    new DomainException(
      400,
      'CANNOT_PAIR_WITH_SELF',
      'No puedes aceptar tu propia invitación',
    ),
  coupleAlreadyActive: () =>
    new DomainException(
      409,
      'COUPLE_ALREADY_ACTIVE',
      'Alguna de las cuentas ya tiene un vínculo de pareja activo',
    ),
  coupleNotFound: () =>
    new DomainException(
      404,
      'COUPLE_NOT_FOUND',
      'No tienes un vínculo de pareja activo',
    ),
  groupRequired: () =>
    new DomainException(
      400,
      'GROUP_REQUIRED',
      'El token de grupo requiere un groupId',
    ),
  groupNotFound: () =>
    new DomainException(404, 'GROUP_NOT_FOUND', 'El grupo no existe'),
  groupClosed: () =>
    new DomainException(409, 'GROUP_CLOSED', 'El grupo ya está cerrado'),
  groupExpired: () =>
    new DomainException(410, 'GROUP_EXPIRED', 'El grupo expiró'),
  groupFull: () =>
    new DomainException(409, 'GROUP_FULL', 'El grupo alcanzó su límite'),
  groupAlreadyMember: () =>
    new DomainException(
      409,
      'GROUP_ALREADY_MEMBER',
      'Ya eres miembro de este grupo',
    ),
};
