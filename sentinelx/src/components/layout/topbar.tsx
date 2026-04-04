"use client";

import { Bell, LogOut, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Topbar() {
  const [supabase] = useState<ReturnType<typeof createClient> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  });
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function onLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="glass sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-800/60 px-6">
      <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-black/50 px-3 py-2 text-sm text-green-400 glass-neon">
        <Search className="h-4 w-4 text-neon" />
        Search events, alerts, incidents...
      </div>
      <div className="flex items-center gap-3">
        {email ? <span className="text-xs text-slate-400">{email}</span> : null}
        <button
          type="button"
          className="relative rounded-lg border border-green-500/30 bg-black/70 p-2 text-green-400 hover:bg-green-500/10 glass-neon"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg border border-red-500/30 bg-black/70 p-2 text-red-400 hover:bg-red-500/10 glass-neon"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
