// src/app/lib/crypto.ts
export async function deriveHash(password: string, saltB64?: string) {
    const enc = new TextEncoder();
    let saltBytes: Uint8Array;
  
    if (saltB64) {
      const bin = atob(saltB64);
      saltBytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) saltBytes[i] = bin.charCodeAt(i);
    } else {
      saltBytes = new Uint8Array(16);
      crypto.getRandomValues(saltBytes);
    }
  
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: saltBytes, iterations: 100_000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const raw = await crypto.subtle.exportKey("raw", key);
    const hashB64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
    const saltOut = saltB64 ?? btoa(String.fromCharCode(...saltBytes));
    return { hashB64, saltB64: saltOut };
  }
  
  export function randomToken(len = 16) {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    let b64 = btoa(String.fromCharCode(...bytes));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  