"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { connectWallet, exportPrivateKey, getConnectedAddress, importPrivateKey, signOut, wipeIdentity } from "../../lib/genlayer/client";
import { toast } from "../ui/Toast";
import { shortAddr } from "../../lib/format";

export function Navbar() {
  const [addr, setAddr] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    getConnectedAddress().then(setAddr);
    const h = (e: Event) => setAddr((e as CustomEvent).detail ?? null);
    window.addEventListener("creator_court.addr", h as EventListener);
    return () => window.removeEventListener("creator_court.addr", h as EventListener);
  }, []);

  async function onConnect() {
    const a = await connectWallet();
    setAddr(a);
  }

  function onSignOut() {
    signOut();
    setAddr(null);
    setMenu(false);
  }

  function onExport() {
    const pk = exportPrivateKey();
    if (!pk) return;
    navigator.clipboard?.writeText(pk);
    toast("Private key copied. Store it somewhere safe.", "success");
    setMenu(false);
  }

  async function onImport() {
    const pk = window.prompt("Paste your backed-up private key (0x + 64 hex):");
    if (!pk) return;
    try {
      const a = importPrivateKey(pk);
      setAddr(a);
      toast("Identity imported", "success");
    } catch (e: any) {
      toast(e?.message || "Import failed", "danger");
    }
    setMenu(false);
  }

  function onWipe() {
    if (!window.confirm("Wipe your local identity? This deletes the key and creates a fresh address next time. Cannot be undone unless you exported the key.")) return;
    wipeIdentity();
    setAddr(null);
    setMenu(false);
    toast("Local identity wiped", "info");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-bg/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-cyan to-violet shadow-glow" />
          <div className="text-sm font-semibold tracking-wide">
            Creator <span className="gradient-text">Court</span>
          </div>
        </Link>
        <nav className="hidden gap-6 text-sm text-muted md:flex">
          <Link href="/explore" className="hover:text-ink">Explore</Link>
          <Link href="/register" className="hover:text-ink">Register work</Link>
          <Link href="/case/new" className="hover:text-ink">Open case</Link>
          <Link href="/about" className="hover:text-ink">About</Link>
        </nav>
        <div className="relative flex items-center gap-2">
          {addr ? (
            <>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(addr);
                  toast("Address copied", "success");
                }}
                title="Click to copy full address"
                className="rounded-md border border-white/10 bg-elevated px-3 py-1.5 text-xs font-medium text-ink hover:border-cyan/50"
              >
                {shortAddr(addr)}
              </button>
              <button
                onClick={() => setMenu((m) => !m)}
                aria-label="Wallet menu"
                title="Wallet menu"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-elevated text-ink hover:border-cyan/50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              <button
                onClick={onSignOut}
                title="Sign out (keeps your key locally)"
                className="hidden rounded-md border border-white/10 bg-elevated px-3 py-1.5 text-xs font-medium text-muted hover:border-danger/40 hover:text-danger md:inline-block"
              >
                Sign out
              </button>
              {menu ? (
                <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-md border border-white/10 bg-elevated text-xs shadow-panel">
                  <Link href={`/creator/${addr}`} onClick={() => setMenu(false)} className="block px-3 py-2 hover:bg-white/5">View my profile</Link>
                  <button onClick={onExport} className="block w-full px-3 py-2 text-left hover:bg-white/5">
                    Copy private key (backup)
                  </button>
                  <button onClick={onImport} className="block w-full px-3 py-2 text-left hover:bg-white/5">
                    Import a different key
                  </button>
                  <button onClick={onSignOut} className="block w-full border-t border-white/5 px-3 py-2 text-left hover:bg-white/5 md:hidden">
                    Sign out (keep key)
                  </button>
                  <button onClick={onWipe} className="block w-full px-3 py-2 text-left text-danger hover:bg-white/5">
                    Wipe identity (new address)
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <button
              onClick={onConnect}
              className="rounded-md bg-gradient-to-r from-cyan to-violet px-3 py-1.5 text-xs font-semibold text-bg shadow-glow hover:opacity-90"
            >
              Connect wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
