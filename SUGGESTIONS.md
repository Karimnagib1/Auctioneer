# Feature Suggestions

Based on market research into gaps in the online auction industry.

---

## 1. Trust & Fraud Prevention

The biggest pain point across all auction platforms is shill bidding and fake accounts.

- **Bid history transparency** — show all bids with timestamps on each auction publicly
- **Bidder verification** — email verification on signup, phone verification before first bid
- **Shill bid detection** — flag or block bids from accounts that only ever bid on auctions owned by the same user
- **Reputation scores** — track win rate, payment history, and bid cancellations per user

---

## 2. Fee Transparency

A massive complaint on eBay, Sotheby's, and Christie's — users abandon when fees are hidden.

- **Buyer's premium / commission system** — configurable fee on top of the winning bid, shown clearly before bidding
- **Fee breakdown on bid confirmation** — show the user exactly what they'll pay before they commit

---

## 3. Auction Lifecycle Improvements

Current statuses are `pending → active → closed/cancelled`. Several transitions are missing:

- **Auto-close auctions** — add an `endDate` field and a cron job to close expired auctions and set a `winnerId`
- **Reserve price** — a minimum price the seller sets; if bidding doesn't reach it, the auction closes without a winner
- **Buy Now price** — a fixed price that immediately closes the auction
- **Auction extensions** — automatically extend the end time by a few minutes if a bid comes in near closing (prevents last-second sniping)

---

## 4. Real-Time & Mobile Experience

- **Outbid notifications** — email or push notification when a user is outbid (currently the WebSocket only broadcasts to users actively watching)
- **Proxy / max bidding** — let a user set a maximum bid and have the system auto-bid on their behalf up to that limit (the most-requested auction feature globally)
- **Countdown timer** — surface the `endDate` (once added) so clients can show a live countdown
---

## 5. Seller Tooling

- **Auction analytics** — number of views, unique bidders, bid activity over time
- **Cancel and relist** — sellers can cancel an active auction and optionally relist it
- **Multiple images** — currently one image per auction; support uploading multiple photos per listing

---

## 6. Niche Verticals to Target

| Niche | Why it fits |
|---|---|
| **Charity auctions** | No dominant platform; add a "charity" flag and donate-proceeds flow |
| **Local / community auctions** | Add location fields and filter by proximity |
| **B2B surplus / equipment** | Add category tags and condition fields |
| **Collectibles** | Add authentication and provenance fields per listing |

---

## Priority Order

If prioritizing by impact on core usability:

1. **Auto-close auctions with a winner** — the platform currently has no way to end auctions
2. **Proxy bidding** — the single most-requested feature in auction UX
3. **Outbid notifications** — users cannot monitor every auction manually
