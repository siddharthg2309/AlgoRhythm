"use client";

import { AuthView as AuthViewUI } from "@daveyplate/better-auth-ui";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export function AuthView({ pathname }: { pathname: string }) {
  const router = useRouter();

  return (
    <main className="container flex grow flex-col items-center justify-center gap-3 self-center">
      {!["settings", "security"].includes(pathname) && (
        <Button className="self-start" variant="outline" onClick={() => router.back()}>
          <ArrowLeftIcon />
          Back
        </Button>
      )}

      {/* v3 component — replaces old AuthPage/AuthCard */}
      <AuthViewUI pathname={pathname} />
    </main>
  );
}