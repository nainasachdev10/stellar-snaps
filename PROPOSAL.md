# StellarSnaps - Stellar Community Fund Proposal

## Introduction

| Field | Value |
|-------|-------|
| **Legal Entity Name** | StellarSnaps |
| **Project Name** | StellarSnaps |
| **Country of Formation** | India |
| **Applicant Names** | Wahid Shaikh, Naina Sachdev, Wajiha Kulsum |
| **Applicant Emails** | yuknomebrawh@gmail.com, nainasachdev01@gmail.com, wajihakulsum786@gmail.com |
| **Primary Category/Vertical** | Payments |
| **Development Stage** | Testnet (Functional MVP with browser extension and web dashboard) |
| **Integration Type** | Native Stellar (No cross-chain integration) |
| **Website** | https://stellar-snaps.vercel.app/ |

---

## Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **Snap** | A shareable payment link containing payment metadata (destination, amount, asset, memo) |
| **SEP-0007** | Stellar Ecosystem Proposal for URI Scheme to facilitate delegated signing |
| **XDR** | External Data Representation - Stellar's transaction encoding format |
| **Freighter** | Popular Stellar wallet browser extension |
| **Discovery File** | JSON file hosted at `/.well-known/stellar-snap.json` that enables snap resolution |

---

## Proposal Summary

### Company Description

StellarSnaps is a startup building payment infrastructure for the Stellar blockchain, focused on making cryptocurrency payments as simple as sharing a link. Our team combines expertise in full-stack development, blockchain technology, and user experience design to create tools that bridge the gap between traditional payment experiences (like Venmo/PayPal) and the Stellar ecosystem.

### Product Description

StellarSnaps enables users to create **shareable payment links** for the Stellar blockchain - similar to Venmo or PayPal request links, but for crypto. The platform consists of three integrated components:

1. **Browser Extension**: Automatically detects snap links on any webpage (Twitter, Discord, websites) and renders interactive payment cards that allow one-click payments using Freighter wallet.

2. **Web Dashboard**: A creator-friendly interface where users can:
   - Connect their Freighter wallet
   - Create and manage payment snaps
   - Configure payment parameters (amount, asset, memo)
   - Share links on social platforms

3. **SDK (@stellar-snaps/sdk)**: A complete TypeScript library for developers to:
   - Create and parse SEP-0007 compliant payment URIs
   - Build and sign Stellar transactions
   - Integrate Freighter wallet
   - Host custom snap endpoints with discovery files

**Key Features:**
- Create payment requests in XLM or any Stellar asset (USDC, etc.)
- Optional fixed amounts or user-entered amounts
- Transaction memos for payment tracking
- Trust verification system (registry of verified domains)
- Automatic URL resolution for shortened links (t.co, bit.ly)

---

## Funding Justification & Benefits

### Why This Funding is Justified

1. **Fills a Critical UX Gap**: Stellar lacks an easy way to share payment requests on social platforms. StellarSnaps brings the "Venmo request link" experience to Stellar.

2. **Increases Stellar Adoption**: By simplifying payments to a single link click, we lower the barrier for new users to interact with Stellar.

3. **Developer Tooling**: The SDK empowers developers to build their own payment experiences on Stellar without reinventing the wheel.

4. **SEP-0007 Compliance**: We implement and promote Stellar standards, strengthening the ecosystem.

### Measurable Value for Stellar

| Metric | Target (6 months) |
|--------|-------------------|
| Unique Snaps Created | 1,000+ |
| Total Transaction Volume (Testnet + Mainnet) | $50,000 USD equivalent |
| SDK Downloads (npm) | 500+ |
| Browser Extension Users | 500+ |
| Integrated Domains (Discovery Files) | 10+ |

---

## Funding Structure: Disbursement Milestones

| # | Milestone Type | Trigger/Metrics | Amount (USD) | Expected Completion |
|---|---------------|-----------------|--------------|---------------------|
| 1 | Upfront Payment | Signing of agreement, testnet MVP live | $5,000 | Month 0 |
| 2 | Mainnet Deployment | Production deployment with 100+ snaps created | $7,500 | Month 2 |
| 3 | Traction Milestone | 500+ extension users, 500+ snaps, $10K transaction volume | $7,500 | Month 4 |
| 4 | Ecosystem Growth | 5+ integrated domains, SDK published on npm with 200+ downloads | $5,000 | Month 6 |

**Total Requested: $25,000 USD**

---

## Core Thesis & Team Conviction

### Why This Problem Matters

Cryptocurrency payments remain friction-filled. Sending someone XLM requires exchanging addresses, copying long strings, and navigating wallet interfaces. Meanwhile, traditional payments have evolved to "send a link, tap to pay."

StellarSnaps bridges this UX gap. By making Stellar payments as simple as sharing a URL, we unlock new use cases:
- Content creators accepting tips via Twitter
- Small businesses sharing payment links
- DAOs distributing payments
- Cross-border remittances via messaging apps

### Why We're Positioned to Win

1. **Built on Proven Patterns**: We've studied Dialect's Blinks (Solana) and Stripe Payment Links, adapting their best ideas for Stellar's unique architecture.

2. **Developer-First Approach**: Our SDK-first strategy means developers can extend and customize the platform, creating network effects.

3. **Standards Compliant**: Full SEP-0007 compliance ensures interoperability with the broader Stellar ecosystem.

4. **Ship Fast, Iterate**: We already have a working MVP on testnet with all core components functional.

---

## Team & Experience

### Founding Team

| Name | Role | Background | LinkedIn |
|------|------|------------|----------|
| Wahid Shaikh | Full-Stack Developer | [Background details] | [LinkedIn URL] |
| Naina Sachdev | Product & Frontend | [Background details] | [LinkedIn URL] |
| Wajiha Kulsum | Backend & Blockchain | [Background details] | [LinkedIn URL] |

### Previous Funding

- **Prior Funding**: None (bootstrapped to MVP)
- **Why Grant vs VC**: We're seeking grant funding to focus on ecosystem value creation rather than equity-driven growth. The Stellar community benefits most from open-source tooling, which aligns better with grant funding than traditional VC models.

### Team Details

| Attribute | Value |
|-----------|-------|
| Team Size | <5 |
| Years in Business | <2 years |
| Soroban Language Experience | Intermediate |

---

## Deliverables

### High-Level Overview

StellarSnaps delivers a complete payment link ecosystem for Stellar:

1. **Browser Extension** (Chrome/Brave) - Detects and renders snap cards on any webpage
2. **Web Application** - Dashboard for creating and managing snaps
3. **SDK Package** - TypeScript library for developers
4. **Documentation** - Comprehensive guides for users and developers
5. **Registry System** - Trust verification for snap-hosting domains

### Deliverable 1: Browser Extension

**Description**: Chrome/Brave extension that automatically detects StellarSnaps links and renders interactive payment cards.

**User Stories**:
- As a Twitter user, I want to see a payment card when someone shares a snap link, so I can pay without leaving the page
- As a payer, I want to see trust verification badges, so I know the payment request is legitimate
- As a payer, I want to enter custom amounts (when allowed), so I can pay what I choose

**Features**:
- Automatic link detection and URL resolution
- Interactive payment cards with Freighter integration
- Trust verification badges (Verified/Unverified)
- Support for all Stellar assets
- SPA navigation handling

### Deliverable 2: Web Dashboard

**Description**: Next.js web application for creating and managing payment snaps.

**User Stories**:
- As a creator, I want to connect my Freighter wallet, so my snaps are linked to my address
- As a creator, I want to create snaps with custom titles and descriptions
- As a creator, I want to set fixed or flexible payment amounts
- As a creator, I want to share snap links on social media

**Features**:
- Freighter wallet connection
- Snap creation form with validation
- Snap management (list, delete)
- Shareable links generation

### Deliverable 3: SDK (@stellar-snaps/sdk)

**Description**: Complete TypeScript SDK for building on StellarSnaps.

**User Stories**:
- As a developer, I want to create SEP-0007 payment URIs programmatically
- As a developer, I want to integrate Freighter wallet into my dApp
- As a developer, I want to host my own snap endpoints
- As a developer, I want type-safe error handling

**Features**:
- SEP-0007 URI creation and parsing
- Transaction building utilities
- Freighter wallet integration
- Discovery file creation
- Typed error classes

### Deliverable 4: Trust Registry

**Description**: System for verifying and tracking trusted snap-hosting domains.

**Features**:
- Domain verification status (trusted/unverified/blocked)
- Registry API endpoint
- Caching for performance
- Admin interface for managing entries

---

## Architecture Overview

### C4 L1 Diagram: High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           StellarSnaps System                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐    │
│  │    User      │     │   Creator    │     │      Developer       │    │
│  │  (Browser)   │     │  (Dashboard) │     │    (SDK Consumer)    │    │
│  └──────┬───────┘     └──────┬───────┘     └──────────┬───────────┘    │
│         │                    │                        │                 │
│         ▼                    ▼                        ▼                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐    │
│  │   Browser    │     │     Web      │     │  @stellar-snaps/sdk  │    │
│  │  Extension   │     │  Dashboard   │     │      (npm pkg)       │    │
│  └──────┬───────┘     └──────┬───────┘     └──────────────────────┘    │
│         │                    │                                          │
│         └────────────┬───────┴──────────────────────────────────────────┤
│                      ▼                                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Stellar Network (Horizon API)                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     Freighter Wallet (User's browser)              │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### C4 L2 Diagram: Zoom into the StellarSnaps System

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              StellarSnaps Platform                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         Browser Extension                                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐   │    │
│  │  │  Content    │  │  Injected   │  │ Background  │  │    Popup      │   │    │
│  │  │  Script     │  │  Script     │  │  Worker     │  │    UI         │   │    │
│  │  │ (DOM scan)  │  │ (Freighter) │  │ (Storage)   │  │               │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                         │                                        │
│                                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           Web Application (Next.js)                      │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐   │    │
│  │  │  Dashboard   │  │  Snap Page   │  │  API Routes  │  │  Registry  │   │    │
│  │  │   /dashboard │  │   /s/[id]    │  │  /api/*      │  │    API     │   │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘   │    │
│  │         │                 │                 │                │          │    │
│  │         └─────────────────┴─────────────────┴────────────────┘          │    │
│  │                                   │                                      │    │
│  │                                   ▼                                      │    │
│  │  ┌──────────────────────────────────────────────────────────────────┐   │    │
│  │  │                     Database (PostgreSQL/Neon)                    │   │    │
│  │  │                     - snaps table                                 │   │    │
│  │  │                     - registry entries                            │   │    │
│  │  └──────────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                           Core SDK Package                               │    │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐    │    │
│  │  │ Payment    │  │ Transaction│  │ Freighter  │  │   Discovery    │    │    │
│  │  │ Snap       │  │ Builder    │  │ Integration│  │   Files        │    │    │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Architecture Constraints

1. **Browser Compatibility**: Extension requires Chrome Manifest V3 compatibility
2. **Wallet Dependency**: Requires Freighter wallet for transaction signing (no custodial keys)
3. **Cross-Origin Limitations**: URL resolution requires a proxy service for shortened URLs
4. **Network Support**: Currently supports Stellar Testnet and Public network only

---

## Contract Overview

**Note**: StellarSnaps does not currently use Soroban smart contracts. All functionality is implemented through:

- Standard Stellar payment operations via Horizon API
- SEP-0007 URI scheme for payment request encoding
- Off-chain storage (PostgreSQL) for snap metadata

**Future Soroban Integration (Potential)**:
- Escrow contracts for milestone-based payments
- Multi-signature approval for high-value snaps
- On-chain registry for verified domains

---

## Technology Stack

### Backend

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Drizzle ORM |
| Stellar SDK | @stellar/stellar-sdk v13 |
| API Style | REST (Next.js API Routes) |

### Frontend

| Component | Technology |
|-----------|------------|
| Framework | React 19 |
| Build Tool | Next.js / Vite |
| Styling | Tailwind CSS |
| UI Components | Radix UI, shadcn/ui |
| State Management | React hooks (useState, useEffect) |
| Wallet Integration | @stellar/freighter-api v6 |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Web Hosting | Vercel |
| Database | Neon (Serverless PostgreSQL) |
| Extension Distribution | Chrome Web Store |
| Package Registry | npm |
| Version Control | GitHub |
| CI/CD | Vercel (automatic deployments) |

### Automated Testing

| Tool | Purpose |
|------|---------|
| Vitest | Unit testing for SDK |
| TypeScript | Static type checking |
| ESLint | Code linting |
| Prettier | Code formatting |

**Test Coverage Areas**:
- SEP-0007 URI generation and parsing
- Stellar address validation
- Transaction building
- Discovery file validation
- Error handling

### Integrations

| Service | Purpose |
|---------|---------|
| Stellar Horizon API | Account data, transaction submission |
| Freighter Wallet | Transaction signing |
| Neon Database | Snap storage |
| Vercel | Hosting and edge functions |

---

## Additional Documents

### Repository

- **GitHub Repository**: [Link to repo]

### Demo

- **Live Demo**: https://stellar-snaps.vercel.app/
- **Demo Video**: [Link to video walkthrough]

### Technical Documentation

- SDK Documentation: See `packages/core/README.md`
- Discovery File Spec: `/.well-known/stellar-snap.json` format

### Discovery File Example

```json
{
  "name": "Stellar Snaps",
  "description": "Interactive payment cards for Stellar",
  "rules": [
    {
      "pathPattern": "/s/*",
      "apiPath": "/api/snap/*"
    }
  ]
}
```

### Database Schema

```typescript
// Snaps Table
{
  id: string,           // Unique snap ID (nanoid)
  creator: string,      // Creator's Stellar address
  title: string,        // Display title
  description: string,  // Optional description
  destination: string,  // Payment destination address
  assetCode: string,    // Asset code (default: XLM)
  assetIssuer: string,  // Asset issuer (for non-XLM)
  amount: string,       // Fixed amount (optional)
  memo: string,         // Transaction memo
  memoType: string,     // Memo type (MEMO_TEXT, MEMO_ID, etc.)
  network: string,      // testnet or public
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Contact

For questions or additional information:

- **Wahid Shaikh**: yuknomebrawh@gmail.com
- **Naina Sachdev**: nainasachdev01@gmail.com
- **Wajiha Kulsum**: wajihakulsum786@gmail.com

---

*This proposal was prepared for the Stellar Community Fund application.*
