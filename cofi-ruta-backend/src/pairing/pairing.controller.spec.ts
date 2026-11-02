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
      createPairingToken: jest
        .fn()
        .mockResolvedValue({ token: 'COFI-123456', qrPayload: '{}' }),
      claimPairingToken: jest
        .fn()
        .mockResolvedValue({ message: 'Successfully paired' }),
      listMyLinks: jest.fn().mockResolvedValue({ duoLinks: [], groups: [] }),
      archiveLink: jest.fn().mockResolvedValue({ message: 'Archived' }),
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

  it('should generate QR token', async () => {
    const res = await controller.createQrToken('u1', { type: 'DUO' });
    expect(res.token).toBe('COFI-123456');
    expect(pairingService.createPairingToken).toHaveBeenCalledWith('u1', {
      type: 'DUO',
    });
  });

  it('should claim pairing token', async () => {
    const res = await controller.claimToken('u2', { token: 'COFI-123456' });
    expect(res.message).toBe('Successfully paired');
    expect(pairingService.claimPairingToken).toHaveBeenCalledWith(
      'u2',
      'COFI-123456',
    );
  });

  it('should list my links', async () => {
    const res = await controller.getMyLinks('u1');
    expect(res.duoLinks).toBeDefined();
    expect(pairingService.listMyLinks).toHaveBeenCalledWith('u1');
  });

  it('should archive link', async () => {
    const res = await controller.archiveLink('u1', 'link-1');
    expect(res.message).toBe('Archived');
    expect(pairingService.archiveLink).toHaveBeenCalledWith('u1', 'link-1');
  });
});
