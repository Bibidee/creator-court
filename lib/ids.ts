function rand(): string {
  const a = new Uint8Array(8);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(a);
  else for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function newWorkId(): string {
  return `w_${Date.now().toString(36)}_${rand().slice(0, 10)}`;
}

export function newCaseId(): string {
  return `c_${Date.now().toString(36)}_${rand().slice(0, 10)}`;
}
