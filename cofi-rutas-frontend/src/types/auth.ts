export type AuthMode = 'login' | 'register';

export type CoffeeSpecialty = 'Submarino' | 'V60 Altura' | 'Mocaccino';

/**
 * AuthUser - Updated to match Better Auth user schema
 * Compatible with both legacy AuthService and Better Auth client
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;           // Better Auth standard field (maps to fullName)
  fullName?: string;      // Legacy compatibility / custom field (optional for Better Auth)
  avatarUrl?: string | null;
  image?: string | null;  // Better Auth standard field (maps to avatarUrl)
  role?: string;
  isActive?: boolean;
  specialty?: string | null;
  emailVerified?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface GoogleSignupDraft {
  signupToken: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface GoogleSignupPromptProps {
  draft: GoogleSignupDraft;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface AuthApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface AuthFeedbackState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AuthFormState {
  mode: AuthMode;
  email: string;
  password: string;
  fullName: string;
  specialty: CoffeeSpecialty;
  showPassword: boolean;
  loading: boolean;
  feedback: AuthFeedbackState | null;
  googleSignup: GoogleSignupDraft | null;
}

export interface AuthHeaderProps {
  altitudeMeters?: number;
  editionBadge?: string;
}

export interface GoogleAuthButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export interface AuthModeTabsProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export interface SpecialtyChipsProps {
  selectedSpecialty: CoffeeSpecialty;
  onSelectSpecialty: (specialty: CoffeeSpecialty) => void;
}

export interface AuthFeedbackProps {
  feedback: AuthFeedbackState | null;
  onDismiss?: () => void;
}

export interface CofiDuoPromoCardProps {
  onLearnMore?: () => void;
}

export interface AuthFooterProps {
  className?: string;
}