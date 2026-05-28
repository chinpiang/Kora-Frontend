/**
 * IPFS upload service via Pinata.
 * Supports XHR progress tracking, CID validation, and retry on 5xx errors.
 */
import type { InvoiceMetadata } from "@/types";
import { withRetry } from "@/lib/utils";

const PINATA_JWT = process.env.PINATA_JWT || "";
const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";
const PINATA_BASE = "https://api.pinata.cloud";

// CID v0 (Qm...) or CID v1 (bafy...)
const CID_REGEX = /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|bafy[a-z2-7]{52,})$/;

export function validateCid(cid: string): void {
  if (!CID_REGEX.test(cid)) {
    throw new Error(`Invalid IPFS CID: ${cid}`);
  }
}

/** Upload a file via XHR so we get real progress events. */
function xhrUpload(
  url: string,
  form: FormData,
  onProgress?: (percent: number) => void
): Promise<{ IpfsHash: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${PINATA_JWT}`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Pinata upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during IPFS upload"));
    xhr.send(form);
  });
}

/**
 * Upload an invoice PDF to IPFS via Pinata with progress tracking.
 * Returns the validated CID.
 */
export async function uploadInvoicePDF(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append(
    "pinataMetadata",
    JSON.stringify({ name: `invoice-${file.name}` })
  );

  const data = await withRetry(
    () => xhrUpload(`${PINATA_BASE}/pinning/pinFileToIPFS`, form, onProgress),
    3
  );

  validateCid(data.IpfsHash);
  return data.IpfsHash;
}

/**
 * Upload invoice metadata JSON to IPFS via Pinata.
 * Returns the validated CID.
 */
export async function uploadInvoiceMetadata(
  metadata: InvoiceMetadata
): Promise<string> {
  const res = await withRetry(
    () =>
      fetch(`${PINATA_BASE}/pinning/pinJSONToIPFS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataMetadata: { name: `invoice-metadata-${metadata.invoiceNumber}` },
          pinataContent: metadata,
        }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`Pinata metadata upload failed: ${r.status}`);
        return r.json() as Promise<{ IpfsHash: string }>;
      }),
    3
  );

  validateCid(res.IpfsHash);
  return res.IpfsHash;
}

/**
 * Upload both PDF and metadata, returning both CIDs.
 */
export async function uploadInvoiceToIPFS(
  file: File,
  metadata: InvoiceMetadata,
  onProgress?: (percent: number) => void
): Promise<{ pdfCid: string; metadataCid: string }> {
  const pdfCid = await uploadInvoicePDF(file, onProgress);
  const metadataCid = await uploadInvoiceMetadata({
    ...metadata,
    documentHash: pdfCid,
    documentUrl: ipfsUrl(pdfCid),
  });
  return { pdfCid, metadataCid };
}

/** Build a public IPFS gateway URL from a CID. */
export function ipfsUrl(cid: string): string {
  return `${IPFS_GATEWAY}/${cid}`;
}

// ─── Legacy helpers (kept for backward compatibility) ─────────────────────────

export async function uploadFileToPinata(
  file: File,
  _name: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return uploadInvoicePDF(file, onProgress);
}

export async function uploadJsonToPinata(
  metadata: Record<string, unknown>,
  _name: string
): Promise<string> {
  const res = await withRetry(
    () =>
      fetch(`${PINATA_BASE}/pinning/pinJSONToIPFS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
          pinataMetadata: { name: _name },
          pinataContent: metadata,
        }),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`Pinata upload failed: ${r.status}`);
        return r.json() as Promise<{ IpfsHash: string }>;
      }),
    3
  );
  validateCid(res.IpfsHash);
  return res.IpfsHash;
}
