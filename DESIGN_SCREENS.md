# PerkBack Mobile — End-to-End Screen Design Reference

## App Stack Overview

```
App Root (_layout.tsx)
├── (auth)          — unauthenticated flows
│   ├── welcome          Splash + onboarding carousel
│   ├── sign-in          Email/password + OAuth sign in
│   ├── sign-up          New customer registration
│   ├── verify           OTP/email verification
│   ├── forgot-password  Password reset
│   └── merchant-signup  Merchant landing (opens perkback.com.au)
├── (onboarding)    — post-auth, first-visit flows
│   ├── choose-role      New user: pick Customer or Merchant
│   ├── choose-account   Dual-account users: pick dashboard
│   ├── card-reveal      Customer: animated loyalty card reveal
│   └── permissions      Push notification opt-in
└── (tabs)          — main authenticated app
    ├── my-card          Loyalty card + QR code
    ├── explore          Nearby stores & offers
    ├── activity         Points history & transactions
    └── profile          Account settings & sign out
```

---

## Auth Routing Logic (`app/_layout.tsx`)

| State | Route |
|-------|-------|
| No session | `/(auth)/welcome` |
| Session + no accounts | `/(onboarding)/choose-role` |
| Session + merchant account | `/(onboarding)/choose-account` |
| Session + customer only | `/(tabs)/my-card` |

---

## Screen Designs

---

### 1. Splash + Onboarding Carousel (`welcome.tsx`)

**Phase 1 — Splash (2.4 s)**

```
┌─────────────────────────────┐
│  ░░ dark navy gradient ░░   │
│                             │
│      ⟳ ring animations      │
│    ┌─────────────────────┐  │
│    │   [ P lettermark ]  │  │  ← logoBox (animated float)
│    └─────────────────────┘  │
│                             │
│         PerkBack            │  ← white, extraBold
│    Every visit, rewarded    │  ← muted white, fade-in
│                             │
└─────────────────────────────┘
```

Colors: `#0a2a6b` → `#071f50` gradient · Gold rings `#ffd07a`

**Phase 2 — Carousel (3 slides)**

Slide 1 — Built around your brand
- Visual: 3 overlapping branded loyalty cards (stacked, rotated)
- BG: `#f0eeff` (soft purple)
- Title: "Built around\nyour brand."
- Sub: "Every local store gets a fully branded loyalty card…"

Slide 2 — Scan, earn, repeat
- Visual: QR code card + gold scan line + "+25 points earned!" badge
- BG: `#fff8ed` (warm cream)
- Title: "Scan, earn,\nrepeat."
- Sub: "Show your QR at the till to earn points instantly…"

Slide 3 — Smart deals nearby
- Visual: Stylised map with location pins (Coffee, Lunch, Bakery, 2× pts)
- BG: `#f0f4ff` (soft blue)
- Title: "Smart deals\nnearby."
- Sub: "Personalised offers from stores around you…"

Bottom controls: `Skip` (outline) + `Continue →` / `Get started →` (navy gradient) + "Already have an account? Sign in"

---

### 2. Sign In (`sign-in.tsx`)

```
┌─────────────────────────────┐
│  ←                          │  ← back button
│                             │
│  [🎁 PerkBack]              │  ← PerkBackLogo component (small)
│                             │
│  Welcome back               │  ← 26pt extraBold
│  Sign in to your account.   │  ← 14pt muted
│                             │
│  Email         ___________  │
│  Password      ___________  │
│                Forgot password? →
│                             │
│  ┌─────────────────────┐    │
│  │      Sign in        │    │  ← navy primary CTA
│  └─────────────────────┘    │
│                             │
│  ─────── or continue with ──│
│                             │
│  ┌─────────────────────┐    │
│  │   Continue with Apple│    │  ← black
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ G  Continue with Google│  │  ← white, border
│  └─────────────────────┘    │
│                             │
│  No account? Create one     │
└─────────────────────────────┘
```

---

### 3. Sign Up (`sign-up.tsx`)

```
┌─────────────────────────────┐
│  ←  [🎁 PerkBack]           │  ← back + logo in header
│                             │
│  Create your account        │
│  Takes about 30 seconds.    │
│                             │
│  Full name     ___________  │
│  Email         ___________  │
│  Mobile    +61 ___________  │
│  Birthday      DD/MM/YYYY   │  ← unlocks birthday rewards 🎁
│  Password      ___________  │
│                             │
│  By continuing you agree to │
│  Terms and Privacy Policy.  │
│                             │
│  ┌─────────────────────┐    │
│  │ Send verification code →│  │  ← navy primary CTA
│  └─────────────────────┘    │
│                             │
│  ─────── or continue with ──│
│                             │
│  ┌─────────────────────┐    │
│  │   Continue with Apple│    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ G  Continue with Google│  │
│  └─────────────────────┘    │
│                             │
│  Have an account? Sign in   │
│  Sign up as a merchant →    │  ← secondary/gold link
└─────────────────────────────┘
```

---

### 4. Email Verification (`verify.tsx`)

```
┌─────────────────────────────┐
│  ←                          │
│                             │
│  Check your inbox           │
│  We sent a code to          │
│  user@email.com             │
│                             │
│  [ _ ][ _ ][ _ ][ _ ][ _ ] [ _ ]│  ← 6-digit OTP
│                             │
│  ┌─────────────────────┐    │
│  │     Verify →        │    │
│  └─────────────────────┘    │
│                             │
│  Didn't get it? Resend      │
└─────────────────────────────┘
```

---

### 5. Forgot Password (`forgot-password.tsx`)

```
┌─────────────────────────────┐
│  ←                          │
│                             │
│  Reset your password        │
│  Enter your email to get    │
│  a reset link.              │
│                             │
│  Email         ___________  │
│                             │
│  ┌─────────────────────┐    │
│  │   Send reset link   │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

### 6. Merchant Signup (`merchant-signup.tsx`)

```
┌─────────────────────────────┐
│  ←                          │
│                             │
│  [🎁 PerkBack]              │
│                             │
│  Set up your store          │
│  on PerkBack                │
│                             │
│  Join hundreds of local     │
│  Australian businesses…     │
│                             │
│  💳  Accept payments        │
│      Seamlessly process     │
│      loyalty points         │
│                             │
│  🎁  Create rewards         │
│      Design custom offers   │
│      that keep customers… │
│                             │
│  📊  Track customers        │
│      See visit patterns,    │
│      top spenders…          │
│                             │
│  ┌─────────────────────┐    │
│  │Continue at perkback.com.au →│  ← opens browser
│  └─────────────────────┘    │
│  Opens in your browser · Free│
│                             │
│  Already have an account?   │
│  Sign in                    │
└─────────────────────────────┘
```

---

### 7. Choose Role (`(onboarding)/choose-role.tsx`)

Shown for brand-new users (no customer or merchant record yet).

```
┌─────────────────────────────┐
│  PerkBack                   │
│                             │
│  How would you like         │
│  to use PerkBack?           │
│                             │
│  ┌──────────────────────┐   │
│  │ 💳  I'm a customer   │   │  → /card-reveal → /(tabs)/my-card
│  │  Earn points &       │   │
│  │  loyalty rewards     │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │ 🏪  I'm a merchant   │   │  → opens perkback.com.au
│  │  Set up my store &   │   │
│  │  manage customers    │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

---

### 8. Choose Account (`(onboarding)/choose-account.tsx`)

Shown when the signed-in user has **both** a customer and merchant account.

```
┌─────────────────────────────┐
│  PerkBack                   │
│                             │
│  Welcome back, Alex         │
│  You have multiple accounts.│
│  Where would you like to go?│
│                             │
│  ┌──────────────────────┐   │
│  │ 💳  Customer Account │   │  → /(tabs)/my-card
│  │  1,240 pts · CRN123  │   │
│  │                    → │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │ 🏪  Merchant Dashboard│  │  → opens perkback.com.au/dashboard
│  │  Luna Café · Web app ↗│  │
│  └──────────────────────┘   │
│                             │
│  You can switch from Profile│
└─────────────────────────────┘
```

---

### 9. Card Reveal (`(onboarding)/card-reveal.tsx`)

Animated loyalty card appear — plays once for new customers.

```
┌─────────────────────────────┐
│                             │
│  Your card is ready! 🎉     │
│                             │
│  ┌──────────────────────┐   │
│  │ PERKBACK             │   │  ← animated flip-in
│  │ LOYALTY              │   │
│  │                      │   │
│  │  Alex Park           │   │
│  │  CRN: PB-2024-XXXXX  │   │
│  │  ●●●●  ●●●●  ●●●●   │   │
│  └──────────────────────┘   │
│                             │
│  ┌─────────────────────┐    │
│  │   View my card →    │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

### 10. My Card Tab (`(tabs)/my-card.tsx`)

Main loyalty card screen for customers.

```
┌─────────────────────────────┐
│  Good morning, Alex  🌤️     │
│                             │
│  ┌──────────────────────┐   │
│  │ PERKBACK LOYALTY     │   │  ← gradient card
│  │                      │   │
│  │  Alex Park           │   │
│  │  1,240 pts           │   │
│  │  CRN: PB-2024-XXXXX  │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │   [  QR CODE  ]      │   │  ← tap to enlarge
│  │   Scan to earn       │   │
│  └──────────────────────┘   │
│                             │
│  Recent Activity            │
│  • Luna Café    +25 pts     │
│  • Bloom Florist +10 pts    │
└─────────────────────────────┘
```

---

### 11. Explore Tab (`(tabs)/explore.tsx`)

Nearby stores and active offers.

```
┌─────────────────────────────┐
│  Nearby stores              │
│  📍 Fitzroy, VIC            │
│                             │
│  ┌──────────────────────┐   │
│  │ Luna Café            │   │
│  │ ☕ Coffee  0.2 km    │   │
│  │ 2× points this week! │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ Bloom Florist        │   │
│  │ 🌸 Flowers  0.5 km   │   │
│  │ Birthday special 🎁  │   │
│  └──────────────────────┘   │
│  ...                        │
└─────────────────────────────┘
```

---

### 12. Activity Tab (`(tabs)/activity.tsx`)

Points history and transaction log.

```
┌─────────────────────────────┐
│  Activity                   │
│                             │
│  Total: 1,240 pts           │
│                             │
│  Today                      │
│  ● Luna Café        +25 pts │
│    12:34 PM                 │
│                             │
│  Yesterday                  │
│  ● Bloom Florist    +10 pts │
│    3:12 PM                  │
│  ● PerkBack HQ     +100 pts │  ← sign-up bonus
│    9:01 AM                  │
└─────────────────────────────┘
```

---

### 13. Profile Tab (`(tabs)/profile.tsx`)

Account settings and sign out.

```
┌─────────────────────────────┐
│  Alex Park                  │
│  alex@email.com             │
│  CRN: PB-2024-XXXXX         │
│                             │
│  ─ Account ──────────────── │
│  Edit profile               │
│  Notifications              │
│  Privacy                    │
│                             │
│  ─ App ─────────────────── │
│  Help & FAQ                 │
│  Terms & Privacy            │
│  About PerkBack             │
│                             │
│  ┌─────────────────────┐    │
│  │      Sign out       │    │
│  └─────────────────────┘    │
│                             │
│  Switch to merchant         │  ← only if user has merchant
│  dashboard ↗                │
└─────────────────────────────┘
```

---

## Component Library

| Component | Path | Usage |
|-----------|------|-------|
| `PerkBackLogo` | `src/components/ui/PerkBackLogo.tsx` | Logo in all auth screens. Props: `size="small\|large"`, `dark={bool}` |

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `PB.primary` | `#0a2a6b` | Navy — primary CTA, card backgrounds |
| `PB.secondary` | `#3f7ad4` | Blue — links, focus states |
| `PB.accent` | `#ffd07a` | Gold — highlights, ribbon on logo |
| `PB.accentStrong` | `#f7b94a` | Darker gold — "Back" in wordmark |
| `PB.fg` | `#0f1830` | Near-black — body text |
| `PB.muted` | `#5b6478` | Grey — secondary text |
| `PB.border` | `#e6e9f0` | Input borders |
| `PB.borderSoft` | `#eef1f6` | Soft dividers, icon backgrounds |
| `PB.bg` | `#fafbfd` | Screen background |

## Typography

| Token | Font | Weight |
|-------|------|--------|
| `FONTS.regular` | DM Sans 400 | Body text |
| `FONTS.medium` | DM Sans 500 | Labels, captions |
| `FONTS.bold` | DM Sans 700 | Buttons, sub-headings |
| `FONTS.extraBold` | DM Sans 700 | Screen titles, wordmark |
| `FONTS.mono` | DM Mono 400 | CRN codes, card numbers |
