import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PORTALS } from "@/config/portals";
import { buildAuthUrl, switchAccount } from "@/lib/auth-return";
import { AccessCard, type AccessState } from "./AccessCard";
const apiBase = import.meta.env.VITE_API_URL || "https://api.scholardesk.pro/api/v1";
const allowedRoles = ["admin", "super_admin"];

/** The API owns the session; no browser storage or UI state can grant access. */
export function PortalAccess({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<AccessState>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const checkAccess = useCallback(async () => {
    setAccess("checking");
    try {
      const response = await fetch(`${apiBase}/auth/me`, { credentials: "include", cache: "no-store" });
      if (response.status === 401) { setAccess("sign-in"); return; }
      if (response.status === 403) { setAccess("wrong-account"); return; }
      if (!response.ok) { setAccess("unavailable"); return; }
      const payload = await response.json() as { user?: { role?: string; email?: string } };
      setEmail(payload.user?.email ?? null);
      setAccess(payload.user?.role && allowedRoles.includes(payload.user.role) ? "allowed" : "wrong-account");
    } catch { setAccess("unavailable"); }
  }, []);

  useEffect(() => {
    void checkAccess();
    const onAuthRequired = () => setAccess("sign-in");
    const onAccessDenied = () => { void checkAccess(); };
    window.addEventListener("scholardesk:auth-required", onAuthRequired);
    window.addEventListener("scholardesk:access-denied", onAccessDenied);
    return () => {
      window.removeEventListener("scholardesk:auth-required", onAuthRequired);
      window.removeEventListener("scholardesk:access-denied", onAccessDenied);
    };
  }, [checkAccess]);

  if (access === "allowed") return <>{children}</>;
  return (
    <AccessCard
      variant="fullscreen"
      state={access}
      portalLabel="Admin portal"
      accountNoun="admin"
      markSrc="/favicon.png"
      signInHref={buildAuthUrl(PORTALS.AUTH)}
      signedInAs={email}
      onRetry={() => void checkAccess()}
      onSwitchAccount={() => { setSwitching(true); void switchAccount(apiBase, PORTALS.AUTH); }}
      switching={switching}
      footer={<>Admin access is granted by a super admin from Settings &amp; Team.</>}
    />
  );
}
