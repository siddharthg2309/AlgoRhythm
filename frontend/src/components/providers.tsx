"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(url) => router.push(url)}
      replace={(url) => router.replace(url)}
      onSessionChange={() => router.refresh()}
      // v3 doesn’t need a custom Link unless you want to provide one
    >
      {children}
    </AuthUIProvider>
  );
}