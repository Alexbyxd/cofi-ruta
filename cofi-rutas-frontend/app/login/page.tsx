'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuthForm } from '../../hooks/useAuthForm';
import {
  AuthHeader,
  GoogleAuthButton,
  GoogleSignupPrompt,
  BrutalistDivider,
  AuthModeTabs,
  AuthFeedback,
  AuthForm,
  CofiDuoPromoCard,
  AuthFooter,
} from '../../components/auth';

export default function LoginPage() {
  const router = useRouter();
  const {
    mode,
    email,
    password,
    fullName,
    specialty,
    showPassword,
    loading,
    feedback,
    setMode,
    setEmail,
    setPassword,
    setFullName,
    setSpecialty,
    toggleShowPassword,
    dismissFeedback,
    googleSignup,
    handleSubmit,
    handleForgotPassword,
    handleGoogleLogin,
    handleGoogleSignupConfirm,
    handleGoogleSignupCancel,
  } = useAuthForm({
    onSuccess: () => router.replace('/dashboard'),
  });

  return (
    <main className="min-h-screen bg-surface flex flex-col justify-start items-center pt-6 sm:pt-10 pb-12 px-4 sm:px-6 lg:justify-center lg:px-8 text-espresso-ink">
      <div className="w-full max-w-md flex flex-col gap-4 sm:gap-5 lg:max-w-5xl lg:grid lg:grid-cols-[42fr_58fr] lg:items-start lg:gap-x-14 lg:gap-y-6">
        {/* Navigation Return Link */}
        <div className="w-full flex items-center justify-start lg:col-span-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink/70 hover:text-espresso-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Brand Column (desktop only as a column; on mobile its children flow inline) */}
        <div className="contents lg:flex lg:flex-col lg:gap-8 lg:col-start-1 lg:row-start-2">
          {/* Brand Stamp & Altitude Header */}
          <AuthHeader altitudeMeters={3735} editionBadge="COFIRUTAS • ORURO" />

          {/* CofiDúo Specialty Badge Banner (desktop placement) */}
          <div className="hidden lg:block">
            <CofiDuoPromoCard />
          </div>
        </div>

        {/* Auth Card (desktop card surface; on mobile its children flow inline) */}
        <div className="contents lg:flex lg:flex-col lg:gap-5 lg:col-start-2 lg:row-start-2 lg:bg-surface-card lg:border-[3px] lg:border-espresso-ink lg:rounded-lg lg:p-8 lg:shadow-[8px_8px_0px_0px_#1A0F0A]">
          {/* Google signup consent (only when Google returned an unknown account) */}
          {googleSignup && (
            <GoogleSignupPrompt
              draft={googleSignup}
              onConfirm={handleGoogleSignupConfirm}
              onCancel={handleGoogleSignupCancel}
              loading={loading}
            />
          )}

          {/* Quick Google Action */}
          <GoogleAuthButton onClick={handleGoogleLogin} disabled={loading} />

          {/* Brutalist Segment Divider */}
          <BrutalistDivider label="O CON TU CUENTA" />

          {/* Mode Selector Tabs */}
          <AuthModeTabs mode={mode} onModeChange={setMode} />

          {/* Feedback Alert / Notification */}
          <AuthFeedback feedback={feedback} onDismiss={dismissFeedback} />

          {/* Main Brutalist Form */}
          <AuthForm
            mode={mode}
            email={email}
            onEmailChange={setEmail}
            password={password}
            onPasswordChange={setPassword}
            fullName={fullName}
            onFullNameChange={setFullName}
            specialty={specialty}
            onSpecialtyChange={setSpecialty}
            showPassword={showPassword}
            onToggleShowPassword={toggleShowPassword}
            onForgotPassword={handleForgotPassword}
            onSubmit={handleSubmit}
            loading={loading}
          />

          {/* Legal & Terms Footer (desktop placement, inside the card) */}
          <div className="hidden lg:block lg:pt-1">
            <AuthFooter />
          </div>
        </div>

        {/* Mobile flow: CofiDúo banner + legal footer keep their original order */}
        <div className="lg:hidden">
          <CofiDuoPromoCard />
        </div>

        <div className="lg:hidden">
          <AuthFooter />
        </div>
      </div>
    </main>
  );
}
