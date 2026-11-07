import { DomainException } from '../common/errors/domain.exception';

export const cafesErrors = {
  notFound: () =>
    new DomainException(
      404,
      'CAFE_NOT_FOUND',
      'La cafetería no existe o no está publicada',
    ),
};
