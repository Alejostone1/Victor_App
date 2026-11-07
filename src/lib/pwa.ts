// App instalable: registro del service worker y aviso de "Instalar" (solo navegador).

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * - installed: ya abre como app.
 * - available: Chrome/Edge ofrece instalar con un toque.
 * - ios: iPhone/iPad, se instala desde "Compartir → Agregar a inicio".
 * - android: Android sin aviso automático (otro navegador o aún no listo): instrucciones del menú.
 * - unsupported: otro caso (p. ej. Firefox de PC).
 */
export type InstallState = "installed" | "available" | "ios" | "android" | "unsupported";

const DISMISS_KEY = "ep-install-dismissed-at";
const DISMISS_DAYS = 14;

let deferred: BeforeInstallPromptEvent | null = null;
let justInstalled = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

if (typeof window !== "undefined") {
  // El evento puede llegar antes de que React pinte: se guarda aquí, al cargar el módulo.
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    justInstalled = true;
    emit();
  });
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

export function subscribeInstall(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInstallState(): InstallState {
  if (justInstalled || isStandalone()) return "installed";
  if (deferred) return "available";
  if (isIos()) return "ios";
  if (/android/i.test(navigator.userAgent)) return "android";
  return "unsupported";
}

export function getServerInstallState(): InstallState {
  return "unsupported";
}

/** Muestra el diálogo del navegador. Devuelve true si el usuario aceptó. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferred = null;
  if (outcome === "accepted") justInstalled = true;
  emit();
  return outcome === "accepted";
}

/** El usuario cerró la tarjeta del inicio: no se vuelve a mostrar en 14 días. */
export function isInstallDismissed(): boolean {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    return Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

export function dismissInstall(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // Sin almacenamiento (modo privado): solo se oculta esta vez.
  }
  emit();
}

/** Registra el service worker en producción. La versión fuerza la actualización en cada despliegue. */
export function registerServiceWorker(): void {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  const version = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
  navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(version)}`, { scope: "/" }).catch((err) => {
    console.warn("[sw] no se pudo registrar", err);
  });
}
