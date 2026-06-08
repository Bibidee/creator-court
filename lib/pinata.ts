export async function uploadFileToPinata(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/pinata/upload", { method: "POST", body: form });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.cid as string;
}

export async function uploadJSONToPinata(payload: unknown): Promise<string> {
  const file = new File([JSON.stringify(payload, null, 2)], "evidence.json", {
    type: "application/json",
  });
  return uploadFileToPinata(file);
}
