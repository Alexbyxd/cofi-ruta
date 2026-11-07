import { Test, TestingModule } from '@nestjs/testing';
import { PairingController } from './pairing.controller';
import { PairingService } from './pairing.service';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class MockAuthGuard {
      canActivate() {
        return true;
      }
    },
  PassportStrategy: () => class MockPassportStrategy {},
}));

describe('PairingController', () => {
  let controller: PairingController;
  let pairingService: any;

  beforeEach(async () => {
    pairingService = {
      createToken: jest
        .fn()
        .mockResolvedValue({ token: 'opaque-token', qrPayload: 'qr' }),
      claimToken: jest.fn().mockResolvedValue({ message: 'Emparejado' }),
      getDuo: jest.fn().mockResolvedValue({ id: 'link-1' }),
      archiveDuo: jest.fn().mockResolvedValue({ message: 'Archivado' }),
      revokeToken: jest.fn().mockResolvedValue({ revoked: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PairingController],
      providers: [{ provide: PairingService, useValue: pairingService }],
    }).compile();

    controller = module.get<PairingController>(PairingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a pairing token', async () => {
    const res = await controller.createToken('u1', { type: 'DUO' });
    expect(res.token).toBe('opaque-token');
    expect(pairingService.createToken).toHaveBeenCalledWith('u1', {
      type: 'DUO',
    });
  });

  it('should claim a pairing token', async () => {
    const res = await controller.claimToken('u2', { token: 'opaque-token' });
    expect(res.message).toBe('Emparejado');
    expect(pairingService.claimToken).toHaveBeenCalledWith(
      'u2',
      'opaque-token',
    );
  });

  it('should return the active duo', async () => {
    const res = await controller.getDuo('u1');
    expect(res.id).toBe('link-1');
    expect(pairingService.getDuo).toHaveBeenCalledWith('u1');
  });

  it('should archive the active duo', async () => {
    const res = await controller.archiveDuo('u1');
    expect(res.message).toBe('Archivado');
    expect(pairingService.archiveDuo).toHaveBeenCalledWith('u1');
  });

  it('should revoke a pairing token', async () => {
    const res = await controller.revokeToken('u1', 'token-1');
    expect(res.revoked).toBe(1);
    expect(pairingService.revokeToken).toHaveBeenCalledWith('u1', 'token-1');
  });
});
