export type AuthMode = 'login' | 'register';

export type CoffeeSpecialty = 'Submarino' | 'V60 Altura' | 'Mocaccino';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
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
