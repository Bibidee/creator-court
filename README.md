# Creator Court

> Originality, evidence, and creator-dispute protocol for GenLayer.
> Evidence first. Judgement second. Public record always.

Creator Court is a GenLayer-native protocol where creators register original work, open evidence-backed copy cases, allow the accused party to respond, and publish public GenLayer verdicts on originality and attribution. Verdicts feed into a wallet-based creator reputation.

This is **not** a legal copyright court. It is **not** a takedown engine. It is public proof and a structured dispute layer.

## Live deployment

- **Network**: GenLayer Studionet (chain id `61999`)
- **RPC**: `https://studio.genlayer.com/api`
- **Explorer**: https://explorer-studio.genlayer.com
- **CreatorCourt contract**: [`0xfB78A172dD886E4fC9a378120EFe1B1983c1582E`](https://explorer-studio.genlayer.com/address/0xfB78A172dD886E4fC9a378120EFe1B1983c1582E)

## Why GenLayer

Originality disputes need judgement over messy evidence: wording, timeline, structure, credit, common idea defences, weak claims. A standard smart contract cannot do that. GenLayer validators read the case, the response, and the evidence pack, and converge on a structured JSON verdict via `gl.eq_principle_strict_eq`. Only IDs, CIDs, hashes, statuses, and verdict summaries live on-chain.

## Stack

- Next.js 16 (App Router, strict TypeScript, Tailwind, npm)
- GenLayer Studionet, one unified contract (`contracts/creator_court.py`)
- IPFS via Pinata for evidence files (server-side JWT, never exposed)
- EVM wallet for creator identity

## Features

- Register original work with title, content type, URL, content hash, evidence pack
- Open copy cases with claim type, comparison notes, comparison evidence
- Accused response flow (defence statement + evidence)
- GenLayer judgement: 7 verdict labels with confidence band and reputation deltas
- Public work page, public case page, public verdict
- Creator profile with reputation, wins, losses, false claims, confirmed originals
- Public disclaimer about scope

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home, hero, how-it-works, verdict types |
| `/register` | Register original work |
| `/work/[workId]` | Public work detail |
| `/case/new` | Open copy case |
| `/case/[caseId]` | Public case detail with response and verdict actions |
| `/creator/[address]` | Public creator profile and reputation |
| `/explore` | Explore + lookup by ID |
| `/about` | Scope and disclaimer |
| `/api/pinata/upload` | Server-side Pinata upload (keeps JWT hidden) |

## Contract functions

`contracts/creator_court.py` (`CreatorCourt`):

- `register_original_work(work_id, title, content_type, original_url, description, evidence_cid, content_hash, creator_handle, tags_json)`
- `open_copy_case(case_id, original_work_id, suspected_url, accused_address, accused_handle, claim_type, claim_explanation, evidence_cid, comparison_notes)`
- `submit_response(case_id, defence_statement, evidence_cid, response_links_json)`
- `request_verdict(case_id)` — GenLayer judgement, strict-JSON output, reputation update
- `get_work`, `get_case`, `get_response`, `get_verdict`
- `get_creator_profile`, `get_creator_works`, `get_creator_cases`, `get_counts`

Verdicts: `CONFIRMED_ORIGINAL`, `LIKELY_COPIED`, `HEAVILY_INSPIRED`, `PROPERLY_CREDITED_REMIX`, `COMMON_IDEA`, `INSUFFICIENT_EVIDENCE`, `FALSE_CLAIM`.
Confidence bands: `LOW`, `MEDIUM`, `HIGH`.

## Install

```powershell
cd "C:\Users\ojiku\Creator Court"
npm install
```

## Configure

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com:8443/api
NEXT_PUBLIC_CREATOR_COURT_CONTRACT_ADDRESS=0xfB78A172dD886E4fC9a378120EFe1B1983c1582E
PINATA_JWT=eyJ...                                  # server-only, NEVER prefix with NEXT_PUBLIC_
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`PINATA_JWT` must never be exposed to the browser. All uploads go through `/api/pinata/upload`.

## Run locally

```powershell
npm run dev
```

Open http://localhost:3000.

## Deploy the contract

1. Open GenLayer Studio (https://studio.genlayer.com) and load `contracts/creator_court.py`.
2. Deploy to Studionet. Copy the deployed contract address.
3. Set `NEXT_PUBLIC_CREATOR_COURT_CONTRACT_ADDRESS` in `.env.local`.
4. Restart the dev server.

## Main flows to test

1. Connect wallet (top right).
2. `/register` — fill the form, upload one screenshot/PDF, submit. You should see a success card with a work ID and a tx ref.
3. Open `/work/[workId]` from the success card.
4. `/case/new?work=<workId>` — open a copy case against a suspected URL with comparison notes and evidence.
5. As the accused wallet, open `/case/[caseId]` and submit a response.
6. As the claimant (or anyone if no accused address was set), click **Request GenLayer verdict** to trigger judgement.
7. Verdict appears on the case page; reputation updates on `/creator/[address]` for both parties.

## Known limitations

- No off-chain indexer in MVP. `/explore` supports direct lookup by ID. Public work/case URLs are the share unit.
- Reputation deltas are clamped to `[-15, 15]` per case. No appeals.
- Filing fee / staking is not enforced in MVP. The spec recommends adding it before public launch to deter spam.
- Wallet handling uses `window.ethereum`. If `genlayer-js` exposes a different account flow on your version, adjust `lib/genlayer/client.ts`.
- The contract uses a monotonic counter for `created_at`. The richer wall-clock timestamp lives in the IPFS evidence pack.
- No moderation panel in MVP (FR-009 is "Should").
- Verdict labels are public, not legal. See `/about`.

## Legal disclaimer

Creator Court provides public, evidence-based originality records and community-readable dispute verdicts. It does not provide legal advice, does not replace courts or copyright offices, and is not a takedown engine. Verdicts use plain-language labels (e.g. "Likely copied") and never legal terms such as "guilty", "liable", "infringement", or "damages".
