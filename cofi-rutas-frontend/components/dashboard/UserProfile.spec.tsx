import { describe, it, expect } from 'vitest';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { UserProfile } from './UserProfile';

const mockUser = {
  id: 'u1',
  email: 'carlos@cofi.com',
  fullName: 'Carlos Morales',
  avatarUrl: 'https://lh3.googleusercontent.com/a/carlos',
  role: 'USER',
  createdAt: '2024-01-01T00:00:00Z',
};

describe('UserProfile', () => {
  it('should render the user full name and avatar', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(UserProfile, { user: mockUser }),
    );

    expect(html).toContain('Carlos Morales');
    expect(html).toContain('carlos@cofi.com');
    expect(html).toContain('https://lh3.googleusercontent.com/a/carlos');
    expect(html).toContain('Cuenta verificada con Google');
  });

  it('should render initials when avatarUrl is missing', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(UserProfile, {
        user: { ...mockUser, avatarUrl: null },
      }),
    );

    expect(html).toContain('Carlos Morales');
    expect(html).toContain('CM');
  });

  it('should not throw when avatarUrl is undefined', () => {
    expect(() =>
      ReactDOMServer.renderToString(
        React.createElement(UserProfile, {
          user: { ...mockUser, avatarUrl: undefined },
        }),
      ),
    ).not.toThrow();
  });
});
