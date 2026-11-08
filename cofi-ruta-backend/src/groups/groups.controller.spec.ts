import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class MockAuthGuard {
      canActivate() {
        return true;
      }
    },
  PassportStrategy: () => class MockPassportStrategy {},
}));

describe('GroupsController', () => {
  let controller: GroupsController;
  let groupsService: any;

  beforeEach(async () => {
    groupsService = {
      create: jest.fn().mockResolvedValue({ id: 'g1', code: 'ABC234' }),
      join: jest.fn().mockResolvedValue({ group: { id: 'g1' } }),
      get: jest.fn().mockResolvedValue({ id: 'g1' }),
      leave: jest.fn().mockResolvedValue({ closed: false }),
      close: jest.fn().mockResolvedValue({ closed: true }),
      createInvite: jest.fn().mockResolvedValue({ token: 'opaque-token' }),
      getMine: jest.fn().mockResolvedValue([{ id: 'g1' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [{ provide: GroupsService, useValue: groupsService }],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a group', async () => {
    const dto = { name: 'Plan', maxMembers: 12, expiresInHours: 24 };
    const res = await controller.create('u1', dto);
    expect(res.id).toBe('g1');
    expect(groupsService.create).toHaveBeenCalledWith('u1', dto);
  });

  it('should join by code or token', async () => {
    await controller.join('u2', { code: 'ABC234' });
    expect(groupsService.join).toHaveBeenCalledWith('u2', { code: 'ABC234' });
  });

  it('should list the groups of the current user', async () => {
    const res = await controller.getMine('u1');
    expect(res.data).toHaveLength(1);
    expect(groupsService.getMine).toHaveBeenCalledWith('u1');
  });

  it('should read one group', async () => {
    await controller.get('u1', 'g1');
    expect(groupsService.get).toHaveBeenCalledWith('u1', 'g1');
  });

  it('should leave and close a group', async () => {
    await controller.leave('u1', 'g1');
    await controller.close('u1', 'g1');
    expect(groupsService.leave).toHaveBeenCalledWith('u1', 'g1');
    expect(groupsService.close).toHaveBeenCalledWith('u1', 'g1');
  });

  it('should create an invite', async () => {
    const res = await controller.createInvite('u1', 'g1');
    expect(res.token).toBe('opaque-token');
    expect(groupsService.createInvite).toHaveBeenCalledWith('u1', 'g1');
  });
});
