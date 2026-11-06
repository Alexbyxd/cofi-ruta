import { DomainException } from '../common/errors/domain.exception';

export const authErrors = {
  emailAlreadyRegistered: () =>
    new DomainException(
      409,
      'EMAIL_ALREADY_REGISTERED',
      'El correo electrónico ya está registrado',
    ),
  invalidCredentials: () =>
    new DomainException(
      401,
      'INVALID_CREDENTIALS',
      'Correo o contraseña incorrectos',
    ),
  invalidRefreshToken: () =>
    new DomainException(
      401,
      'INVALID_REFRESH_TOKEN',
      'El token de refresco no es válido o expiró',
    ),
  sessionExpired: () =>
    new DomainException(
      401,
      'SESSION_EXPIRED',
      'La sesión expiró o fue revocada',
    ),
  sessionNotFound: () =>
    new DomainException(404, 'SESSION_NOT_FOUND', 'Sesión no encontrada'),
  accountInactive: () =>
    new DomainException(403, 'ACCOUNT_INACTIVE', 'La cuenta está desactivada'),
  userNotFound: () =>
    new DomainException(404, 'USER_NOT_FOUND', 'Usuario no encontrado'),
  wrongPassword: () =>
    new DomainException(
      400,
      'WRONG_PASSWORD',
      'La contraseña actual es incorrecta',
    ),
  passwordNotSet: () =>
    new DomainException(
      400,
      'PASSWORD_NOT_SET',
      'La cuenta no tiene una contraseña local configurada',
    ),
  googleEmailNotVerified: () =>
    new DomainException(
      401,
      'GOOGLE_EMAIL_NOT_VERIFIED',
      'Google no confirmó que el correo electrónico sea verificado',
    ),
};
