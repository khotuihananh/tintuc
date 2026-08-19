"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstall() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  };

  if (installed || dismissed || !installEvent) return null;

  return (
    <aside className="fixed left-3 right-3 top-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-amber-300/20 bg-[#102c50]/95 px-4 py-3 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-xl" aria-hidden>
        ↥
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Cài ứng dụng Giá thị trường</p>
        <p className="mt-0.5 text-xs text-white/60">Mở nhanh như một ứng dụng, không cần tìm lại trên trình duyệt.</p>
      </div>
      <button onClick={install} className="shrink-0 rounded-xl bg-amber-400 px-3 py-2 text-xs font-bold text-[#071426] transition-transform active:scale-95">
        Cài đặt
      </button>
      <button onClick={() => setDismissed(true)} className="shrink-0 p-1 text-white/50" aria-label="Đóng thông báo cài đặt">
        ×
      </button>
    </aside>
  );
}
