'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuthForm } from '../../hooks/useAuthForm';
import {
  AuthHeader,
  GoogleAuthButton,
  BrutalistDivider,
  AuthModeTabs,
  AuthFeedback,
  AuthForm,
  CofiDuoPromoCard,
  AuthFooter,
} from '../../components/auth';

export default function LoginPage() {
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
    handleSubmit,
    handleForgotPassword,
    handleGoogleLogin,
  } = useAuthForm();

  return (
    <main className="min-h-screen bg-surface flex flex-col justify-start items-center pt-6 sm:pt-10 pb-12 px-4 sm:px-6 text-espresso-ink">
      <div className="w-full max-w-md flex flex-col gap-4 sm:gap-5">
        {/* Navigation Return Link */}
        <div className="w-full flex items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-espresso-ink/70 hover:text-espresso-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Brand Stamp & Altitude Header */}
        <AuthHeader altitudeMeters={3735} editionBadge="COFIRUTAS • ORURO" />

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

        {/* CofiDúo Specialty Badge Banner */}
        <CofiDuoPromoCard />

        {/* Legal & Terms Footer */}
        <AuthFooter />
      </div>
    </main>
  );
}
