"use client";
// GenLayer Studionet client + Studio-style local account.
//
// GenLayer Studio does not use MetaMask. It uses a local-signing keypair created with
// `createAccount(privateKey)` from genlayer-js. We generate one on first use, persist
// the private key in localStorage, and reuse it across sessions. This matches how the
// official GenLayer Studio examples bootstrap a creator wallet.

import { createAccount, createClient, generatePrivateKey, chains } from "genlayer-js";

const PK_KEY = "creator_court.pk";
const SIGNED_IN_KEY = "creator_court.signed_in";
const SESSION_ADDR_EVENT = "creator_court.addr";

export type Address = string;

function loadOrCreatePrivateKey(): `0x${string}` {
  if (typeof window === "undefined") return "0x".padEnd(66, "0") as `0x${string}`;
  let pk = window.localStorage.getItem(PK_KEY) as `0x${string}` | null;
  if (!pk) {
    pk = generatePrivateKey();
    window.localStorage.setItem(PK_KEY, pk);
  }
  return pk;
}

let _account: ReturnType<typeof createAccount> | null = null;
function getAccount() {
  if (typeof window === "undefined") return null;
  if (_account) return _account;
  const pk = loadOrCreatePrivateKey();
  _account = createAccount(pk);
  return _account;
}

export async function getConnectedAddress(): Promise<Address | null> {
  if (typeof window === "undefined") return null;
  // Address is shown only when the user is "signed in". The key stays in localStorage.
  if (!window.localStorage.getItem(SIGNED_IN_KEY)) return null;
  if (!window.localStorage.getItem(PK_KEY)) return null;
  const a = getAccount();
  return a?.address ?? null;
}

export async function connectWallet(): Promise<Address | null> {
  if (typeof window === "undefined") return null;
  loadOrCreatePrivateKey();
  window.localStorage.setItem(SIGNED_IN_KEY, "1");
  const a = getAccount();
  const addr = a?.address ?? null;
  if (addr) {
    window.dispatchEvent(new CustomEvent(SESSION_ADDR_EVENT, { detail: addr }));
  }
  return addr;
}

/** Hide the address from UI but KEEP the local key, so reconnect returns the same address. */
export function signOut(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SIGNED_IN_KEY);
  window.dispatchEvent(new CustomEvent(SESSION_ADDR_EVENT, { detail: null }));
}

/** Destructive: wipe the local key so the next connect generates a NEW address. */
export function wipeIdentity(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PK_KEY);
  window.localStorage.removeItem(SIGNED_IN_KEY);
  _account = null;
  _client = null;
  window.dispatchEvent(new CustomEvent(SESSION_ADDR_EVENT, { detail: null }));
}

/** Back-compat alias for the menu — same as signOut (non-destructive). */
export function disconnectWallet(): void {
  signOut();
}

/** Export the local key so the user can back it up or move to another browser. */
export function exportPrivateKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PK_KEY);
}

/** Import a backed-up key. Replaces any existing local key. */
export function importPrivateKey(pk: string): Address | null {
  if (typeof window === "undefined") return null;
  const clean = pk.trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(clean)) throw new Error("Invalid private key format. Expected 0x + 64 hex.");
  window.localStorage.setItem(PK_KEY, clean);
  window.localStorage.setItem(SIGNED_IN_KEY, "1");
  _account = null;
  _client = null;
  const a = getAccount();
  const addr = a?.address ?? null;
  if (addr) window.dispatchEvent(new CustomEvent(SESSION_ADDR_EVENT, { detail: addr }));
  return addr;
}

export function rpcUrl(): string {
  // Always go through our same-origin proxy in the browser to avoid CORS.
  // The proxy forwards to NEXT_PUBLIC_GENLAYER_RPC_URL on the server.
  if (typeof window !== "undefined") return "/api/genlayer/rpc";
  return process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com:8443/api";
}

export function contractAddress(): `0x${string}` | "" {
  return (process.env.NEXT_PUBLIC_CREATOR_COURT_CONTRACT_ADDRESS || "") as any;
}

export function isContractConfigured(): boolean {
  return Boolean(contractAddress());
}

export function explorerTxUrl(hash: string): string {
  return `https://studio.genlayer.com/transactions/${hash}`;
}

let _client: ReturnType<typeof createClient> | null = null;
let _consensusInit: Promise<void> | null = null;

function getClient() {
  if (_client) return _client;
  const account = getAccount();
  const url = rpcUrl();
  // genlayer-js@1.1.7 ships chains.studionet with a real consensusMainContract baked in.
  // We override rpcUrls so genlayer-js's internal fetches go through our same-origin proxy.
  const base = (chains as any).studionet;
  const chain = {
    ...base,
    rpcUrls: { default: { http: [url] } },
  };
  _client = createClient({
    chain,
    endpoint: url,
    ...(account ? { account } : {}),
  });
  return _client;
}

async function ensureConsensusInitialised() {
  const client = getClient();
  // Already initialised
  if ((client as any).chain?.consensusMainContract?.address) return;
  if (!_consensusInit) {
    _consensusInit = (async () => {
      try {
        await (client as any).initializeConsensusSmartContract();
      } catch (e) {
        _consensusInit = null; // allow retry
        throw e;
      }
    })();
  }
  await _consensusInit;
}

const FUNDED_KEY = "creator_court.funded";

/** Fund the local account on Studio via sim_fundAccount. Idempotent per session. */
async function ensureFunded(): Promise<void> {
  if (typeof window === "undefined") return;
  const account = getAccount();
  if (!account) return;
  const flagKey = `${FUNDED_KEY}.${account.address.toLowerCase()}`;
  if (window.localStorage.getItem(flagKey)) return;
  try {
    const res = await fetch(rpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "sim_fundAccount",
        params: [account.address, 1000],
      }),
    });
    const data = await res.json().catch(() => null);
    if (data && !data.error) {
      window.localStorage.setItem(flagKey, "1");
    } else if (data?.error) {
      // Method may not exist on this Studio build — fall through and let the write try anyway.
      console.warn("sim_fundAccount:", data.error);
    }
  } catch (e) {
    console.warn("sim_fundAccount failed:", e);
  }
}

export async function readContract<T = unknown>(method: string, args: unknown[] = []): Promise<T> {
  const client = getClient();
  const address = contractAddress();
  if (!address) throw new Error("Contract address not configured");
  const res = await client.readContract({
    address: address as any,
    functionName: method,
    args: args as any,
  });
  return res as T;
}

export async function writeContract(method: string, args: unknown[] = []): Promise<string> {
  const client = getClient();
  const address = contractAddress();
  if (!address) throw new Error("Contract address not configured");
  if (!getAccount()) throw new Error("No wallet — call connectWallet() first");
  // genlayer-js routes writes through the ConsensusMain contract on the chain.
  // That contract's address is fetched from the RPC on first use.
  await ensureConsensusInitialised();
  // Studio rejects unfunded accounts — fund first.
  await ensureFunded();
  const tx = await client.writeContract({
    address: address as any,
    functionName: method,
    args: args as any,
    value: 0n,
  });
  try {
    await client.waitForTransactionReceipt({ hash: tx as any, status: "FINALIZED" as any });
  } catch {
    // Best effort; the tx hash is still useful for the user.
  }
  return tx as unknown as string;
}
