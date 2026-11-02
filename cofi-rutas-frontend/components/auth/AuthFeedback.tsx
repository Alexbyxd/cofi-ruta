import React from 'react';
import type { AuthFeedbackProps } from '../../types/auth';

export const AuthFeedback: React.FC<AuthFeedbackProps> = ({
  feedback,
  onDismiss,
}) => {
  if (!feedback || !feedback.message) return null;

  const isSuccess = feedback.type === 'success';
  const isError = feedback.type === 'error';

  const containerClasses = isSuccess
    ? 'bg-badge-matcha text-white'
    : isError
    ? 'bg-error-container text-on-error-container'
    : 'bg-primary-container text-espresso-ink';

  const iconName = isSuccess ? 'done_all' : isError ? 'warning' : 'info';

  return (
    <div
      role="alert"
      className={`p-2.5 rounded-lg border-[2px] border-espresso-ink font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wide flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#1A0F0A] ${containerClasses} w-full`}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] shrink-0">
          {iconName}
        </span>
        <span className="leading-snug">{feedback.message}</span>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 hover:opacity-75 cursor-pointer shrink-0"
          aria-label="Cerrar notificación"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
};
