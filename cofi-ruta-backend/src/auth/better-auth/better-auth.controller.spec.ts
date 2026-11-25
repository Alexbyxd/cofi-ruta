import type { Request, Response } from 'express';
import { BetterAuthController } from './better-auth.controller';

const mockHandler = jest.fn();

jest.mock('./auth.provider', () => ({
  getAuth: () => ({ handler: mockHandler }),
}));

function createRequest(originalUrl: string): Request {
  return {
    originalUrl,
    protocol: 'http',
    method: 'POST',
    headers: { host: 'localhost:3001' },
    get: (name: string) => (name === 'host' ? 'localhost:3001' : undefined),
    rawBody: Buffer.from('{"provider":"google"}'),
  } as unknown as Request;
}

function createResponse(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    send: jest.fn(),
    headersSent: false,
  } as unknown as Response;
}

describe('BetterAuthController', () => {
  beforeEach(() => {
    mockHandler.mockReset();
    mockHandler.mockResolvedValue(
      new Response(
        JSON.stringify({ url: 'https://accounts.google.com/o/oauth2/v2/auth' }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
  });

  it('forwards the full request path to the Better Auth handler', async () => {
    const controller = new BetterAuthController();
    const req = createRequest('/api/v1/auth/sign-in/social');
    const res = createResponse();

    await controller.handle(req, res);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    const webRequest = mockHandler.mock.calls[0][0] as Request;
    expect(webRequest.url).toBe(
      'http://localhost:3001/api/v1/auth/sign-in/social',
    );
    expect(webRequest.method).toBe('POST');
  });

  it('relays the handler status and body to the Express response', async () => {
    const controller = new BetterAuthController();
    const req = createRequest('/api/v1/auth/get-session');
    const res = createResponse();

    await controller.handle(req, res);

    const response = res as unknown as { status: jest.Mock; send: jest.Mock };
    expect(response.status).toHaveBeenCalledWith(200);
    // `res` is typed as the express Response, where `status` and `send` are
    // methods, so a direct reference trips @typescript-eslint/unbound-method;
    // read the mocks through a non-method view instead of binding them.
    expect(response.send).toHaveBeenCalledWith(
      Buffer.from(
        JSON.stringify({ url: 'https://accounts.google.com/o/oauth2/v2/auth' }),
      ),
    );
  });

  it('forwards the path verbatim and never rewrites it to /api/auth', async () => {
    const controller = new BetterAuthController();
    const req = createRequest('/api/v1/auth/sign-in/social');
    const res = createResponse();

    await controller.handle(req, res);

    const webRequest = mockHandler.mock.calls[0][0] as Request;
    expect(new URL(webRequest.url).pathname).toBe(
      '/api/v1/auth/sign-in/social',
    );
    expect(webRequest.url).not.toContain('/api/auth');
  });

  it('preserves the query string of the original request', async () => {
    const controller = new BetterAuthController();
    const req = createRequest('/api/v1/auth/get-session?foo=1&bar=2');
    Object.defineProperty(req, 'method', { value: 'GET' });
    const res = createResponse();

    await controller.handle(req, res);

    const webRequest = mockHandler.mock.calls[0][0] as Request;
    expect(webRequest.url).toBe(
      'http://localhost:3001/api/v1/auth/get-session?foo=1&bar=2',
    );
  });
});
