<div align="center">
  <img src="https://img.shields.io/badge/Stellar-Soroban-14b8a6?style=for-the-badge&logo=stellar&logoColor=white" alt="Stellar Soroban" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License" />
</div>

<br />

<div align="center">
  <h1>⬡ Kora Protocol</h1>
  <p><strong>On-chain Invoice Financing built on Stellar Soroban</strong></p>
  <p>SMEs tokenize unpaid invoices as NFTs and sell them at a discount to global liquidity providers — unlocking instant stablecoin liquidity without banks.</p>
</div>

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Core User Flows](#core-user-flows)
- [Smart Contract Integration](#smart-contract-integration)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Kora Protocol is a decentralized invoice financing platform built on [Stellar Soroban](https://soroban.stellar.org/). It bridges the gap between SMEs in emerging markets who need working capital and global investors seeking yield on short-duration, real-world assets.

**The problem:** SMEs in Africa, Asia, and Latin America hold trillions of dollars in unpaid invoices. Traditional invoice financing is slow, expensive, and inaccessible to most small businesses.

**The solution:** Kora tokenizes invoices as NFTs on Stellar Soroban. Investors fund them via USDC. Settlement is instant, transparent, and non-custodial.

### How It Works

```
SME                    Kora Protocol              Investor
 │                          │                         │
 ├─ Upload Invoice ─────────►                         │
 │                          ├─ Store on IPFS          │
 │                          ├─ Mint NFT on Soroban    │
 │                          ├─ List on Marketplace ───►
 │                          │                         ├─ Browse & Fund
 │◄─ Receive USDC ──────────┤◄─ USDC Deposited ───────┤
 │                          │                         │
 │  (on due date)           │                         │
 ├─ Repay Principal ────────►                         │
 │                          ├─ Distribute Yield ──────►
 │                          │                         │
```

---

## Live Demo

> **Testnet deployment:** [https://kora-protocol.vercel.app](https://kora-protocol.vercel.app) *(coming soon)*

To run locally, see [Getting Started](#getting-started).

---

## Features

### For SMEs
- ✅ Connect Stellar wallet (Freighter, xBull, LOBSTR, Albedo)
- ✅ Upload invoice PDF to IPFS via Pinata
- ✅ Mint invoice as NFT on Soroban with one click
- ✅ Set custom discount rate and minimum investment
- ✅ Receive USDC instantly when invoice is funded
- ✅ Dashboard to track all active invoices and repayments

### For Investors
- ✅ Browse marketplace with filters (category, jurisdiction, risk tier, APR)
- ✅ View detailed invoice information and risk scores
- ✅ Fund invoices with USDC (partial or full)
- ✅ Real-time funding progress bars
- ✅ Portfolio dashboard with yield tracking
- ✅ Analytics with charts (portfolio growth, yield, risk distribution)

### Protocol
- ✅ Non-custodial — funds held in Soroban smart contract escrow
- ✅ On-chain risk scoring and repayment history
- ✅ IPFS-stored invoice metadata (tamper-proof)
- ✅ Transaction status toasts with hash links
- ✅ Optimistic UI updates

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.6 |
| Styling | TailwindCSS 3.4 + CSS Variables |
| UI Components | Custom + Radix UI primitives |
| State Management | Zustand 5 |
| Data Fetching | TanStack Query v5 |
| Animations | Framer Motion 11 |
| Forms | React Hook Form + Zod |
| Charts | Recharts 2 |
| File Upload | React Dropzone |
| Notifications | Sonner |
| Blockchain | Stellar Soroban (via `@stellar/stellar-sdk`) |
| Wallet | Stellar Wallets Kit (`@creit.tech/stellar-wallets-kit`) |
| Storage | IPFS via Pinata |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Stellar wallet browser extension ([Freighter](https://freighter.app) recommended)
- A [Pinata](https://pinata.cloud) account for IPFS uploads (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/kora-frontend.git
cd kora-frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables section)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Start with Mock Data

The app ships with mock data enabled by default (`NEXT_PUBLIC_ENABLE_MOCK_DATA=true`). You can browse the marketplace, view invoice details, and explore dashboards without a live Soroban connection.

To test wallet interactions, install [Freighter](https://freighter.app), switch it to **Testnet**, and fund your account via [Stellar Friendbot](https://friendbot.stellar.org).

---

## Project Structure

```
kora-frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + providers
│   ├── globals.css               # Global styles + CSS variables
│   ├── providers.tsx             # QueryClient, Toaster, WalletModal
│   ├── marketplace/
│   │   ├── page.tsx              # Invoice marketplace listing
│   │   └── [id]/page.tsx         # Invoice detail + fund panel
│   ├── invoice/
│   │   └── create/page.tsx       # 3-step create invoice wizard
│   ├── dashboard/
│   │   ├── sme/page.tsx          # SME dashboard
│   │   └── investor/page.tsx     # Investor dashboard
│   └── analytics/page.tsx        # Portfolio analytics + charts
│
├── components/
│   ├── ui/                       # Reusable primitive components
│   │   ├── button.tsx
│   │   ├── card.tsx              # Card + GlassCard
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── progress.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── stat-card.tsx
│   ├── invoice/
│   │   └── InvoiceCard.tsx       # Marketplace invoice card
│   ├── wallet/
│   │   ├── WalletConnectModal.tsx
│   │   └── WalletButton.tsx
│   └── layout/
│       └── Navbar.tsx
│
├── hooks/
│   ├── useWallet.ts              # Stellar Wallets Kit wrapper
│   ├── useTransaction.ts         # Build → sign → submit lifecycle
│   └── useInvoices.ts            # TanStack Query invoice hooks
│
├── lib/
│   ├── stellar/
│   │   ├── client.ts             # Soroban RPC + Horizon client
│   │   ├── contracts.ts          # Contract call builders
│   │   └── index.ts
│   ├── ipfs.ts                   # Pinata upload helpers
│   ├── utils.ts                  # cn(), formatCurrency, etc.
│   └── validations/
│       └── invoice.ts            # Zod schemas
│
├── services/
│   ├── mockData.ts               # Mock invoices + stats
│   └── invoiceService.ts         # Invoice CRUD + contract calls
│
├── store/
│   ├── walletStore.ts            # Wallet state (persisted)
│   ├── invoiceStore.ts           # Marketplace filters + sort
│   ├── uiStore.ts                # Modal + tx state
│   └── index.ts
│
├── types/
│   ├── invoice.ts                # Invoice, InvoiceMetadata, etc.
│   ├── user.ts                   # WalletState, UserProfile, etc.
│   ├── contract.ts               # ContractConfig, TxState, etc.
│   └── index.ts
│
├── .env.example                  # Environment variable template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Stellar Network
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# Contract Addresses (deploy your own or use testnet deployments)
NEXT_PUBLIC_INVOICE_CONTRACT_ID=C...
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID=C...
NEXT_PUBLIC_TOKEN_CONTRACT_ID=C...

# IPFS (Pinata)
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
PINATA_JWT=your_pinata_jwt_token

# Feature Flags
NEXT_PUBLIC_ENABLE_MOCK_DATA=true   # Set to false for live data
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

---

## Core User Flows

### SME: Create and Finance an Invoice

1. Connect wallet via **Connect Wallet** button
2. Navigate to **Create Invoice**
3. Fill in invoice details (debtor, amount, due date, jurisdiction)
4. Set discount rate and minimum investment
5. Upload invoice PDF
6. Click **Mint Invoice NFT** — this:
   - Uploads PDF to IPFS via Pinata
   - Uploads metadata JSON to IPFS
   - Builds a Soroban `mint_invoice` transaction
   - Prompts wallet for signature
   - Submits to Stellar network
7. Invoice appears on marketplace
8. As investors fund it, USDC flows to your wallet

### Investor: Fund an Invoice

1. Connect wallet
2. Browse **Marketplace** — filter by APR, risk tier, jurisdiction
3. Click an invoice card to view details
4. Enter investment amount (respects min/max)
5. Review expected return
6. Click **Fund Invoice** — this:
   - Builds a Soroban `fund_invoice` transaction
   - Prompts wallet for signature
   - Submits to Stellar network
7. Position appears in **Investor Dashboard**
8. On repayment date, principal + yield is returned

---

## Smart Contract Integration

The frontend interacts with two Soroban contracts:

### Invoice Contract (`lib/stellar/contracts.ts`)

| Method | Description |
|--------|-------------|
| `mint_invoice(ipfs_cid, amount, financing_amount, discount_rate, due_date)` | Mints a new invoice NFT |
| `get_invoice(token_id)` | Reads invoice state |
| `update_status(token_id, status)` | Updates invoice status (owner only) |

### Marketplace Contract

| Method | Description |
|--------|-------------|
| `fund_invoice(token_id, amount)` | Investor funds an invoice |
| `repay_invoice(token_id)` | SME repays; triggers yield distribution |
| `get_positions(investor)` | Returns all investor positions |

### Transaction Flow

```typescript
// 1. Build unsigned transaction
const unsignedXdr = await invoiceContract.mintInvoice(params, walletAddress);

// 2. Sign with wallet
const signedXdr = await walletKit.signTransaction(unsignedXdr, { ... });

// 3. Submit to Soroban RPC
const result = await rpc.sendTransaction(tx);

// 4. Poll for confirmation
const confirmed = await waitForTransaction(result.hash);
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## Roadmap

- [ ] **v0.2** — Live Soroban contract deployment on testnet
- [ ] **v0.3** — KYC/KYB integration (Synaps or Fractal ID)
- [ ] **v0.4** — Secondary market for invoice positions
- [ ] **v0.5** — Risk oracle integration (on-chain credit scoring)
- [ ] **v0.6** — Multi-currency support (EURC, native XLM)
- [ ] **v1.0** — Mainnet launch

---

## License

MIT © 2025 Kora Protocol Contributors

---

<div align="center">
  <p>Built with ❤️ on Stellar Soroban</p>
  <p>
    <a href="https://stellar.org">Stellar</a> ·
    <a href="https://soroban.stellar.org">Soroban</a> ·
    <a href="https://nextjs.org">Next.js</a>
  </p>
</div>
