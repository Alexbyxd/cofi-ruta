// El prefijo `api/v1` y la DB de prueba salen del mismo entorno que los specs de
// `test/db`: nunca se apunta a mano a una base que no termine en `_test`.
import './db/setup-env';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { uniqueSuffix } from './db/helpers';

interface TestRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: { id: string; role: string };
}

/**
 * Reemplazo determinista de `JwtAuthGuard`: la sesión se declara por headers.
 * Todo lo demás (incluido `MerchantGuard`) es el de producción, que es lo que
 * estas pruebas tienen que ejercitar.
 */
class HeaderSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<TestRequest>();
    const id = req.headers['x-test-user-id'];
    const userId = Array.isArray(id) ? id[0] : id;

    if (!userId) {
      throw new UnauthorizedException('No autenticado');
    }

    const role = req.headers['x-test-user-role'];
    req.user = {
      id: userId,
      role: (Array.isArray(role) ? role[0] : role) ?? 'USER',
    };

    return true;
  }
}

type Method = 'get' | 'post' | 'patch' | 'delete';

function session(userId: string, role = 'USER'): Record<string, string> {
  return { 'x-test-user-id': userId, 'x-test-user-role': role };
}

jest.setTimeout(60000);

describe('Merchants (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let server: App;

  let shopId: string;
  let foreignShopId: string;
  let singleOwnerShopId: string;
  let ownerId: string;
  let managerId: string;
  let staffId: string;
  let outsiderOwnerId: string;
  let singleOwnerId: string;
  let candidateEmail: string;

  const createdUserIds: string[] = [];
  const createdShopIds: string[] = [];

  function staffUrl(id: string, userId?: string): string {
    const base = `/api/v1/merchants/${id}/staff`;
    return userId === undefined ? base : `${base}/${userId}`;
  }

  function send(
    method: Method,
    url: string,
    headers: Record<string, string> = {},
    body?: unknown,
  ) {
    const agent = request(server);

    switch (method) {
      case 'get':
        return agent.get(url).set(headers);
      case 'post':
        return agent
          .post(url)
          .set(headers)
          .send(body as object);
      case 'patch':
        return agent
          .patch(url)
          .set(headers)
          .send(body as object);
      case 'delete':
        return agent.delete(url).set(headers);
    }
  }

  async function createShop(name: string) {
    const suffix = uniqueSuffix();
    const shop = await prisma.coffeeShop.create({
      data: {
        name: `${name} ${suffix}`,
        slug: `e2e-${name.toLowerCase()}-${suffix}`,
        address: 'Calle de prueba 123',
        latitude: '-17.960000',
        longitude: '-67.110000',
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    createdShopIds.push(shop.id);

    return shop.id;
  }

  async function createUser(
    name: string,
    role: 'USER' | 'SUPERADMIN' = 'USER',
  ) {
    const user = await prisma.user.create({
      data: {
        email: `${name.toLowerCase()}-${uniqueSuffix()}@cofi.test`,
        fullName: `${name} de prueba`,
        role,
      },
      select: { id: true, email: true },
    });
    createdUserIds.push(user.id);

    return user;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(HeaderSessionGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    // Mismo prefijo global que monta `main.ts`.
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get(PrismaService);
    server = app.getHttpServer();

    shopId = await createShop('Café Propio');
    foreignShopId = await createShop('Café Ajeno');
    singleOwnerShopId = await createShop('Café Un Solo Dueño');

    const owner = await createUser('Owner');
    const manager = await createUser('Manager');
    const barista = await createUser('Barista');
    const outsider = await createUser('Owner Ajeno');
    const soleOwner = await createUser('Dueño Único');
    const candidate = await createUser('Candidato');

    ownerId = owner.id;
    managerId = manager.id;
    staffId = barista.id;
    outsiderOwnerId = outsider.id;
    singleOwnerId = soleOwner.id;
    candidateEmail = candidate.email;

    await prisma.merchantStaff.createMany({
      data: [
        { coffeeShopId: shopId, userId: ownerId, role: 'OWNER' },
        { coffeeShopId: shopId, userId: managerId, role: 'MANAGER' },
        { coffeeShopId: shopId, userId: staffId, role: 'STAFF' },
        { coffeeShopId: foreignShopId, userId: outsiderOwnerId, role: 'OWNER' },
        {
          coffeeShopId: singleOwnerShopId,
          userId: singleOwnerId,
          role: 'OWNER',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.merchantStaff.deleteMany({
      where: { coffeeShopId: { in: createdShopIds } },
    });
    await prisma.coffeeShop.deleteMany({
      where: { id: { in: createdShopIds } },
    });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });

    await app.close();
  });

  const allRoutes: { method: Method; url: string; body?: unknown }[] = [
    { method: 'get', url: '' },
    {
      method: 'post',
      url: '',
      body: { email: 'nadie@cofi.test', role: 'STAFF' },
    },
    { method: 'patch', url: ':target', body: { role: 'MANAGER' } },
    { method: 'delete', url: ':target' },
  ];

  function routeOf(route: (typeof allRoutes)[number]): string {
    return route.url === ':target'
      ? staffUrl(shopId, staffId)
      : staffUrl(shopId);
  }

  it('answers 401 without a session on all four routes', async () => {
    for (const route of allRoutes) {
      const response = await send(route.method, routeOf(route), {}, route.body);
      expect({ route: route.method, status: response.status }).toEqual({
        route: route.method,
        status: 401,
      });
    }
  });

  it('rejects a MANAGER on all four routes without touching the staff', async () => {
    for (const route of allRoutes) {
      const response = await send(
        route.method,
        routeOf(route),
        session(managerId),
        route.body,
      );

      expect({ route: route.method, status: response.status }).toEqual({
        route: route.method,
        status: 403,
      });
    }

    // El 403 viene del guard: el handler no corrió y nada cambió en la base.
    const rows = await prisma.merchantStaff.findMany({
      where: { coffeeShopId: shopId },
      select: { userId: true, role: true },
    });
    expect(rows).toHaveLength(3);
    expect(rows.find((row) => row.userId === staffId)?.role).toBe('STAFF');
  });

  it('rejects a STAFF on all four routes', async () => {
    for (const route of allRoutes) {
      const response = await send(
        route.method,
        routeOf(route),
        session(staffId),
        route.body,
      );
      expect({ route: route.method, status: response.status }).toEqual({
        route: route.method,
        status: 403,
      });
    }
  });

  it('rejects the OWNER of another merchant', async () => {
    const list = await send('get', staffUrl(shopId), session(outsiderOwnerId));
    expect(list.status).toBe(403);

    const invite = await send(
      'post',
      staffUrl(shopId),
      session(outsiderOwnerId),
      { email: candidateEmail, role: 'STAFF' },
    );
    expect(invite.status).toBe(403);
  });

  it('lets the OWNER list, invite, promote and remove staff', async () => {
    const list = await send('get', staffUrl(shopId), session(ownerId));
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(3);
    expect(
      list.body.data.map((row: { user: { email: string } }) => row.user.email),
    ).not.toContain(candidateEmail);

    const invite = await send('post', staffUrl(shopId), session(ownerId), {
      email: candidateEmail,
      role: 'STAFF',
    });
    expect(invite.status).toBe(201);
    expect(invite.body).toMatchObject({
      coffeeShopId: shopId,
      role: 'STAFF',
      user: { email: candidateEmail },
    });

    const candidateId = invite.body.userId as string;

    const promote = await send(
      'patch',
      staffUrl(shopId, candidateId),
      session(ownerId),
      { role: 'MANAGER' },
    );
    expect(promote.status).toBe(200);
    expect(promote.body.role).toBe('MANAGER');

    const remove = await send(
      'delete',
      staffUrl(shopId, candidateId),
      session(ownerId),
    );
    expect(remove.status).toBe(200);
    expect(remove.body).toMatchObject({ userId: candidateId });

    const after = await send('get', staffUrl(shopId), session(ownerId));
    expect(after.body.data).toHaveLength(3);
  });

  it('lets a SUPERADMIN manage the staff without a membership', async () => {
    const superadmin = await createUser('Superadmin', 'SUPERADMIN');

    const list = await send(
      'get',
      staffUrl(shopId),
      session(superadmin.id, 'SUPERADMIN'),
    );
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(3);
  });

  it('answers MERCHANT_ROLE_NOT_ASSIGNABLE through the real pipeline', async () => {
    const response = await send('post', staffUrl(shopId), session(ownerId), {
      email: candidateEmail,
      role: 'OWNER',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      code: 'MERCHANT_ROLE_NOT_ASSIGNABLE',
    });
  });

  it('answers LAST_OWNER_PROTECTED through the real pipeline', async () => {
    const response = await send(
      'delete',
      staffUrl(singleOwnerShopId, singleOwnerId),
      session(singleOwnerId),
    );

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      statusCode: 409,
      code: 'LAST_OWNER_PROTECTED',
    });

    const remaining = await prisma.merchantStaff.count({
      where: { coffeeShopId: singleOwnerShopId, role: 'OWNER' },
    });
    expect(remaining).toBe(1);
  });

  it('answers 404 MERCHANT_NOT_FOUND for an unknown shop on every route', async () => {
    const unknownShop = `fantasma-${uniqueSuffix()}`;
    const superadmin = await createUser('Superadmin Sondeo', 'SUPERADMIN');
    const superadminSession = session(superadmin.id, 'SUPERADMIN');
    const responses = [
      await send('get', staffUrl(unknownShop), superadminSession),
      await send('post', staffUrl(unknownShop), superadminSession, {
        email: candidateEmail,
        role: 'STAFF',
      }),
      await send('patch', staffUrl(unknownShop, staffId), superadminSession, {
        role: 'MANAGER',
      }),
      await send('delete', staffUrl(unknownShop, staffId), superadminSession),
    ];

    for (const response of responses) {
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        statusCode: 404,
        code: 'MERCHANT_NOT_FOUND',
      });
    }
  });

  it('does not let an OWNER probe which shops exist', async () => {
    // Para un OWNER el guard responde 403 antes del handler, tanto si el
    // comercio existe y es ajeno como si no existe: el código de estado no
    // distingue los dos casos.
    const unknownShop = `fantasma-${uniqueSuffix()}`;

    const unknown = await send('get', staffUrl(unknownShop), session(ownerId));
    const foreign = await send(
      'get',
      staffUrl(foreignShopId),
      session(ownerId),
    );

    expect(unknown.status).toBe(403);
    expect(foreign.status).toBe(403);
    expect(unknown.body).toMatchObject(foreign.body);
  });
});
