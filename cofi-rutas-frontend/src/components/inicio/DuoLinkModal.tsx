'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link as LinkIcon, Phone, QrCode, X } from 'lucide-react';
import { pairingService } from '@/services/pairing.service';
import type { PairingToken } from '@/services/pairing.service';

type ScannerInstance = {
  start: (
    config: Record<string, unknown>,
    options: Record<string, unknown>,
    onDecoded: (text: string) => void,
    onError: (err: string) => void,
  ) => Promise<unknown>;
  stop: () => Promise<unknown>;
};

/**
 * Modal de vinculación CofiDúo / Grupo.
 *
 * Se abre desde el Heart de AppHeader y permite:
 *  - "Compartir mi QR": genera un token de emparejamiento y muestra el QR
 *    para que otro usuario lo escanee.
 *  - "Escanear QR": abre la cámara del dispositivo, lee un QR ajeno y
 *    reclama el vínculo sin salir de la pantalla de Inicio.
 *
 * Diseño neobrutalista: bordes gruesos #1A0F0A, sombra [6px 6px 0px 0px #1A0F0A],
 * fondo #FAF4EC, tipografía Space Grotesk.
 */
export function DuoLinkModal({
  onClose,
  onLinked,
}: {
  onClose: () => void;
  onLinked: () => void;
}) {
  const [tab, setTab] = useState<'share' | 'scan'>('share');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<PairingToken | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<ScannerInstance | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  // --- Compartir: generar token + render QR como Data URL -----------------

  const generateToken = useCallback(async (type: 'DUO' | 'GROUP') => {
    setLoading(true);
    setError(null);
    try {
      const created = await pairingService.createQrToken(type);
      setToken(created);

      // qrcode se importa dinámicamente solo en el cliente para no romper el build SSR de Next.js.
      const QRCodeMod = await import('qrcode');
      const QRCode = QRCodeMod.default ?? QRCodeMod;
      const dataUrl: string = await QRCode.toDataURL(created.token, {
        type: 'image/png',
        width: 260,
        margin: 2,
        color: {
          dark: '#1A0F0A',
          light: '#FFFFFF',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo generar el código QR',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'share' && !token) {
      const timer = setTimeout(() => {
        void generateToken('DUO');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [tab, token, generateToken]);

  // --- Escanear: claim primero (declarado antes de startScanner) ------------

  const handleClaim = useCallback(
    async (tokenString: string) => {
      setLoading(true);
      setError(null);
      try {
        await pairingService.claimToken(tokenString);
        onLinked();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo reclamar el código QR',
        );
      } finally {
        setLoading(false);
      }
    },
    [onLinked],
  );

  const startScanner = useCallback(async () => {
    if (scannerRef.current) return;
    try {
      // html5-qrcode se importa dinámicamente para evitar fallos en SSR.
      const { Html5Qrcode } = await import('html5-qrcode');
      const id = videoRef.current?.id ?? 'reader';
      const instance = new Html5Qrcode(id) as unknown as ScannerInstance;
      scannerRef.current = instance;

      await instance.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
        },
        (decodedText: string) => {
          void instance.stop().catch(() => {});
          scannerRef.current = null;
          setScannerReady(false);
          void handleClaim(decodedText);
        },
        () => {
          // Ignora errores de frame continuo.
        },
      );
      setScannerReady(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo acceder a la cámara. Asegurate de permitir el acceso.',
      );
      setLoading(false);
    }
  }, [handleClaim]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      scannerRef.current = null;
      setScannerReady(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
        setScannerReady(false);
      }
    };
  }, []);

  const handleShareCopy = useCallback(() => {
    if (!token) return;
    navigator.clipboard
      .writeText(token.token)
      .then(() => {
        setError('Token copiado al portapapeles');
        setTimeout(() => setError(null), 2000);
      })
      .catch(() => {
        setError('No se pudo copiar el token');
      });
  }, [token]);

  const handleDownloadQr = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'cofi-rutas-qr-duo.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [qrDataUrl]);

  const handleClose = () => {
    void stopScanner();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1A0F0A]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Vincular cuenta CofiDúo"
    >
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className="w-full max-w-sm sm:max-w-md p-6 bg-[#FAF4EC] border-[4px] border-espresso-ink shadow-[6px_6px_0px_0px_#1A0F0A] rounded-none flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-espresso-ink" strokeWidth={2.5} />
            <span className="font-[family-name:var(--font-space-grotesk)] text-[18px] uppercase text-espresso-ink font-bold tracking-tight">
              Vincular cuenta
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded border border-espresso-ink bg-[#FFFFFF] shadow-[2px_2px_0px_0px_#1A0F0A] hover:bg-[#F48E6A] transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4 text-espresso-ink" />
          </button>
        </div>

        {/* Pestañas Compartir / Escanear */}
        <div className="flex gap-1">
          <button
            onClick={() => setTab('share')}
            className={`flex-1 py-2 uppercase font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold tracking-wider rounded-t-none border-b-[3px] border-espresso-ink ${
              tab === 'share'
                ? 'bg-[#1A0F0A] text-[#FFFFFF]'
                : 'bg-[#FFFFFF] text-espresso-ink'
            } shadow-[2px_2px_0px_0px_#1A0F0A]`}
          >
            Compartir
          </button>
          <button
            onClick={() => setTab('scan')}
            className={`flex-1 py-2 uppercase font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold tracking-wider rounded-t-none border-b-[3px] border-espresso-ink ${
              tab === 'scan'
                ? 'bg-[#1A0F0A] text-[#FFFFFF]'
                : 'bg-[#FFFFFF] text-espresso-ink'
            } shadow-[2px_2px_0px_0px_#1A0F0A]`}
          >
            Escanear
          </button>
        </div>

        {/* Contenido Compartir */}
        {tab === 'share' && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-xs aspect-square bg-[#FFFFFF] border-[3px] border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] flex items-center justify-center p-2">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Código QR de vinculación"
                  className="w-full h-full block"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#795741]">
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Generando QR…
                  </span>
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 bg-[#FAF4EC]/90 flex items-center justify-center">
                  <span className="text-[10px] uppercase font-bold text-espresso-ink">
                    Espere
                  </span>
                </div>
              )}
            </div>

            {token && (
              <div className="w-full text-center">
                <span className="font-[family-name:var(--font-space-grotesk)] text-[11px] uppercase tracking-widest text-[#795741] font-bold block mb-1">
                  Token: {token.token}
                </span>
                <span className="font-[family-name:var(--font-dm-sans)] text-[11px] text-[#795741] block mb-3">
                  Válido hasta{' '}
                  {new Date(token.expiresAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleShareCopy}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-[#FFFFFF] border-[3px] border-espresso-ink text-espresso-ink font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#1A0F0A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1A0F0A] disabled:opacity-50"
                  >
                    <LinkIcon className="w-3 h-3 mr-1" strokeWidth={2.5} />
                    Copiar token
                  </button>
                  <button
                    onClick={handleDownloadQr}
                    disabled={loading || !qrDataUrl}
                    className="flex-1 py-2.5 bg-[#6B8E4E] border-[3px] border-[#6B8E4E] text-[#FFFFFF] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#1A0F0A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1A0F0A] disabled:opacity-50"
                  >
                    Descargar QR
                  </button>
                </div>
              </div>
            )}

            <div className="w-full text-center">
              <span className="font-[family-name:var(--font-dm-sans)] text-[10px] text-[#795741] leading-relaxed">
                Mostrale este código a tu pareja o amigo para vincularse en
                Modo Dúo o Grupo.
              </span>
            </div>
          </div>
        )}

        {/* Contenido Escanear */}
        {tab === 'scan' && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-sm aspect-square bg-[#FFFFFF] border-[3px] border-espresso-ink shadow-[3px_3px_0px_0px_#1A0F0A] overflow-hidden">
              <div ref={videoRef} id="reader" className="w-full h-full" />
              {loading && (
                <div className="absolute inset-0 bg-[#FAF4EC]/90 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase font-bold text-espresso-ink mb-1">
                    Escaneando…
                  </span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-24 h-24 border-[4px] border-[#6B8E4E] border-t-transparent rounded-full animate-spin shadow-[2px_2px_0px_0px_#1A0F0A]" />
              </div>
            </div>

            <div className="w-full text-center">
              <span className="font-[family-name:var(--font-dm-sans)] text-[10px] text-[#795741] leading-relaxed">
                Apuntá al código QR de la otra persona. Se detectará
                automáticamente.
              </span>
            </div>

            {!scannerReady && !loading && (
              <button
                onClick={() => {
                  setLoading(true);
                  void startScanner();
                }}
                className="py-2.5 bg-[#F48E6A] border-[3px] border-[#F48E6A] text-[#1A0F0A] font-[family-name:var(--font-space-grotesk)] text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_#1A0F0A] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1A0F0A]"
              >
                <Phone className="w-3 h-3 mr-1" strokeWidth={2.5} />
                Activar cámara
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="w-full bg-[#FFDAD6] text-[#93000A] border-[3px] border-[#93000A] rounded shadow-[2px_2px_0px_0px_#1A0F0A] p-3">
            <span className="font-[family-name:var(--font-dm-sans)] text-[11px] font-medium leading-relaxed">
              {error}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
