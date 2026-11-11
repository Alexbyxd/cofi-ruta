"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Página de callback para autenticación OAuth (popup mode)
 *
 * Better Auth redirige aquí tras completar el flujo OAuth en el popup.
 * Esta página notifica a la ventana principal (opener) y se cierra.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Notificar a la ventana principal que la autenticación terminó
    if (window.opener && !window.opener.closed) {
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (error) {
        window.opener.postMessage(
          {
            type: "GOOGLE_AUTH_ERROR",
            message: errorDescription || error,
          },
          window.location.origin
        );
      } else {
        window.opener.postMessage(
          { type: "GOOGLE_AUTH_SUCCESS" },
          window.location.origin
        );
      }
    }

    // Cerrar el popup después de un breve delay para permitir que el mensaje se procese
    setTimeout(() => {
      window.close();
    }, 100);
  }, [searchParams]);

  // Si no hay opener (usuario llegó directo a esta URL), redirigir al dashboard
  useEffect(() => {
    if (!window.opener || window.opener.closed) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #34A853",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
        <p>Completando autenticación...</p>
        <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Esta ventana se cerrará automáticamente.
        </p>
      </div>
    </div>
  );
}