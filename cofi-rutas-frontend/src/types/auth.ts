export type AuthMode = 'login' | 'register';

export type CoffeeSpecialty = 'Submarino' | 'V60 Altura' | 'Mocaccino';

/**
 * AuthUser - display model shared by the app UI.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;           // Better Auth standard field (maps to fullName)
  fullName?: string;      // Custom field (optional for Better Auth)
  avatarUrl?: string | null;
  image?: string | null;  // Better Auth standard field (maps to avatarUrl)
  role?: string;
  isActive?: boolean;
  specialty?: string | null;
  emailVerified?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Step of the optional Google account-linking offer shown after a password
 * login.
 *
 * - `ask`      the user can link Google to the current account
 * - `linking`  the Google popup is open
 * - `mismatch` the Google email differs from the account email; Google wins
 * - `error`    linking or switching failed; the copy names what happened
 */
export type GoogleLinkPrompt =
  | { kind: 'ask' }
  | { kind: 'linking' }
  | { kind: 'mismatch' }
  | { kind: 'error'; title: string; message: string; actionLabel: string };

export interface GoogleLinkPromptProps {
  prompt: GoogleLinkPrompt;
  email: string;
  onConfirm: () => void;
  onDecline: () => void;
  onContinueWithGoogle: () => void;
  onDismissError: () => void;
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
  linkPrompt: GoogleLinkPrompt | null;
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
