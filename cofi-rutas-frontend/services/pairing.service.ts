export interface PairingToken {
  token: string;
  type: 'DUO' | 'GROUP';
  expiresAt: string;
  qrPayload: string;
}

export interface PairingLink {
  id: string;
  status: 'ACTIVE' | 'ARCHIVED';
  startedAt: string;
  partner: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    email: string;
  };
}

export interface PairingGroup {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface MyLinksResult {
  duoLinks: PairingLink[];
  groups: PairingGroup[];
}

export interface IPairingService {
  createQrToken(type: 'DUO' | 'GROUP', groupId?: string): Promise<PairingToken>;
  claimToken(token: string): Promise<{
    message: string;
    type: 'DUO' | 'GROUP';
    link?: PairingLink;
    membership?: PairingGroup;
  }>;
  listMyLinks(): Promise<MyLinksResult>;
  archiveLink(linkId: string): Promise<{
    message: string;
    link: PairingLink;
  }>;
}

export class PairingService implements IPairingService {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    const rawUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    this.baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Error en emparejamiento';
      throw new Error(message);
    }

    return data as T;
  }

  async createQrToken(
    type: 'DUO' | 'GROUP',
    groupId?: string,
  ): Promise<PairingToken> {
    return this.request<PairingToken>('/pairing/qr-token', {
      method: 'POST',
      body: JSON.stringify({ type, groupId }),
    });
  }

  async claimToken(token: string) {
    return this.request<{
      message: string;
      type: 'DUO' | 'GROUP';
      link?: PairingLink;
      membership?: PairingGroup;
    }>('/pairing/claim', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async listMyLinks(): Promise<MyLinksResult> {
    return this.request<MyLinksResult>('/pairing/my-links');
  }

  async archiveLink(linkId: string) {
    return this.request<{ message: string; link: PairingLink }>(
      `/pairing/links/${linkId}/archive`,
      { method: 'PATCH' },
    );
  }
}

export const pairingService = new PairingService();
