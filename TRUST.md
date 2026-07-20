# TRUST.md — What Otian AI Is Allowed To Claim

Trust is the product. This file is the contract that keeps it true.

Every privacy or safety claim on otianai.com must appear below, in approved wording,
with a pointer to the code that makes it true. If a claim isn't here, it doesn't ship.

**Owner: Jett.** Jett owns technical processes; Jack owns business ops and marketing.

That split is the point. The person who knows what the code actually does holds a **veto** over
the person who writes the copy — not a seat at the table, a veto. If Jett says a sentence isn't
true, it doesn't ship, and there is no appeal to how good it sounds.

**Last verified against the Archie source:** 2026-07-20 (site + code reconciliation, `Archie@main`)

**Reconciliation — 2026-07-20.** The two Phase-1 features this file tracked as unbuilt have
**shipped** and were re-verified in code today; their ⛔/🚧 sections below have moved to ✅ with
pointers. (1) **Calendar approval gate** — writes stage instead of executing
(`gateway.rs:2006-2072`); the apply tool is only offered on a turn *after* the proposing one
(`gateway.rs:1963-1979`; snapshot rule `gateway.rs:1946-1950`); unattended routines cannot
apply writes at all (`gateway.rs:2041-2047`). (2) **Email send behind a Send tap** — the model
has no email-send tool; drafts arrive as chat cards with Send/Edit/Dismiss buttons, and
`gmail_send_reply` has exactly one caller: the "send" button handler (`email/replies.rs:507`,
`google.rs:279`; callback plumbing `telegram.rs:917-925`). The `gmail.compose` scope is
requested only when the user opts into send at connect time (`commands.rs:3054-3059`).
Site copy on business/, faq/, how-it-works/, privacy-policy/, questionnaire/,
terms-of-service/, and trust/ that describes these flows in the present tense — a ⛔ under the
07-15 rules — is therefore **true and stays**. The homepage approval card, removed earlier on
07-20 while this file was stale, has been restored in the approved wording below.

**Reconciliation — 2026-07-15.** The site was audited against this file and brought into
compliance since the 07-14 pass. Verified fixed and now live in approved wording: the
three-things disclosure (was the ⛔ "subscription active" falsehood); removal of the
"Approval Required for Sends and Purchases" claim and every "nothing sends without your OK"
variant; the required web-search egress clause (`trust/index.html:179`); the volunteered
calendar-delete disclosure; and — in code — the `gmail.compose` scope, no longer requested
(`src-tauri/src/commands.rs:2338`, guarded by test `gmail_requests_readonly_only`).
**Still unbuilt (verified in code, not just copy):** the action approval gate — `calendar_delete_event`
still dispatches immediately (`gateway.rs:1738`); the only `Gate` type is the inbound access
roster (`access.rs`), which governs who may talk *to* the agent, not what it does. The claims
came down; the feature has not gone up. Do not let the claims return.
*[Superseded 2026-07-20: the gate and the Send-tap email flow have since shipped and been
verified — see the 07-20 reconciliation above.]*

---

## The Test

> Could I defend this exact sentence to a hostile engineer with a packet sniffer,
> using only what ships today?

If no, it does not ship. Not "we're building it," not "it's basically true,"
not "the spirit is right." No.

**Corollary — the tense rule:** no claim describes an unshipped feature in the present
tense. Roadmap items are labelled as roadmap, with a date, or they are absent.

**Corollary — the volunteer rule:** when a fact is unflattering and we could have
omitted it, we state it anyway. The unflattering item you volunteer buys more belief
than the flattering one you argue for. Every gap in a disclosure reads as concealment.

---

## Canonical Claims — verified, safe to ship

Each is stated in the strongest form the code supports, and no stronger.

### ✅ No Otian custodian — no server of ours holds your content

**Approved wording (positioning):** "Otian isn't a custodian of your data. Your
conversations, your files, your calendar live on your own computer and go straight to your
AI provider on your own account — they never pass through an Otian server, so there's
nothing on our side to breach, subpoena, or sell. A legal demand to us can only produce
what we actually hold: your email, whether you own a license, and which paid add-ons you
bought."

**Why it's true:** a synthesis of three already-verified claims below — "Your prompts never
touch an Otian server" (`llm.rs:16,18`, `lib.rs:41-48`), "What We Hold — three things"
(`auth.rs:237-244`, `stripe-webhook`), and "We ship no telemetry and no analytics." There is
no Otian datastore of user content for a breach or subpoena to reach.

**Boundaries — do not cross:**
- ❌ Never "no third party ever holds/sees your data." Prompts still go to Anthropic/OpenAI
  (a third party) for inference. This claim is about **Otian** custody, not the provider. Keep
  the provider-egress clause visible wherever this appears.
- ❌ Never say "your data" unscoped — we **do** hold email + license status + paid add-ons.
  Scope it to content: "conversations, files, calendar." The three-things disclosure is the floor.
- ❌ Never "nothing to subpoena." A subpoena to us yields email + license status + paid add-ons.
  The true strong form is "your *content* can't be produced from us — we don't have it."
- ❌ NOT a compliance certification. It does not make Archie "HIPAA-compliant" or
  "GDPR-compliant" — content still flows to a cloud AI provider under the user's own account.
  No regulated-vertical badge without separately verifying the provider data path for that rule.
- Any contrast with a named competitor is a claim about **them** — verify and attribute before printing.

**Positioning note:** this is the one claim a cloud-hosted competitor structurally cannot match.
It's about custody and legal exposure, not secrecy. Lead with "no custodian," never "more private" —
local-model tools that keep the model on-device are genuinely more private on inference; we compete
on custody, not privacy maximalism.

### ✅ Your prompts never touch an Otian server

**Approved wording:** "When your agent thinks, it talks to Anthropic or OpenAI directly
from your machine, on your account, with your key. We are not in the middle of it, and we
keep no copy."

**Why it's true:** Provider base URLs are hard-coded constants
(`crates/archie-net/src/llm.rs:16,18`) — no env var, setting, or flag can redirect them.
The HTTP client is built with no proxy (`crates/archie-net/src/lib.rs:41-48`). The agent
runtime crate contains zero Otian hosts. The webview's CSP (`src-tauri/tauri.conf.json:24`)
forbids the frontend from reaching any host at all.

**Required clause — do not drop it:** web search runs on the *provider's* infrastructure
and is billed to the user's key (`llm.rs:580-605`). Still not us, but the search query does
reach the provider's search backend. Say so.

### ✅ We ship no telemetry and no analytics

**Approved wording:** "Archie contains no analytics, no telemetry, and no tracking of any
kind. Not opt-out — absent."

**Why it's true:** No Sentry, PostHog, Amplitude, Mixpanel, Segment, or GA in `Cargo.lock`
or `package-lock.json`. The Tauri log plugin is a no-op stub (`src-tauri/src/lib.rs:276-278`).
The webview CSP makes frontend network calls impossible.

### ✅ Crash logs never leave your machine

**Approved wording:** "If Archie crashes, it writes a log to your own disk. There is no
upload path. It reaches us only if you attach it to an email yourself."

**Why it's true:** `install_crash_logger` (`src-tauri/src/lib.rs:22-49`) appends to
`~/Library/Application Support/com.archie.app/crash.log`. Nothing in the codebase reads
that file or transmits it.

### ✅ The update check tells us nothing about you

**Approved wording:** "Archie checks for updates with a plain request that carries no
version number, no machine ID, and no account. Our server sees an IP address and a timestamp."

**Why it's true:** `src-tauri/tauri.conf.json:45` has no substitution placeholders, so the
updater plugin sends a bare GET. Version comparison happens client-side.

### ✅ Your API key stays in the Keychain

**Approved wording:** "Your provider key is stored in your Mac's Keychain. It is sent to
Anthropic or OpenAI and nowhere else — we have no way to read it."

**Why it's true:** `KeychainStore` is the only store compiled into a release build
(`src-tauri/src/lib.rs:100-103`); the plaintext dev store is `#[cfg(debug_assertions)]`
(`crates/archie-core/src/secrets.rs:210`) and is **not in the release binary**, so no flag
can reach it. The key is transmitted only as `x-api-key` to Anthropic / bearer to OpenAI.

**Nuance — do not overclaim:** the key is necessarily held in process memory while in use
(`secrets.rs:62-67`, `gateway.rs:46`). Never imply it isn't. "We have no way to read it" is
true and sufficient.

### ✅ We cannot see which free add-ons you install

**Approved wording:** "Installing a free add-on makes no network call at all. We don't know
you did it."

**Why it's true:** `require_owned_if_paid` returns early when `price_cents == 0`
(`src-tauri/src/commands.rs:1112`); the template is served from the binary or the
already-cached catalog. Zero requests.

### ✅ It works while you sleep

**Approved wording:** "It Works While You Sleep" / "works in the background while you sleep."
Used as a homepage proof chip and in the homepage meta description.

**Why it's true:** Routines fire on a schedule, unattended, and deliver their result to the
connected chat (`crates/archie-domain/src/routine.rs:70-100`); Telegram is the default delivery.
The agent genuinely runs and reports without the user present.

**⚠️ Scope guard — do not extend this into a Phase 2 claim.** "Works while you sleep" (background
execution) is true today. "Works while you sleep **and checks in for your approval before it
acts**" is NOT — that is the approval gate, which does not exist. The chip must stay a pure
capability claim. And note the honest tension: the unattended path is exactly where an ungated
agent is most exposed to prompt injection (see the gate section). The claim is true; the risk it
implies is the reason the gate is being built.

### ✅ Add-ons are data, not code

**Approved wording:** "An add-on is a text file, not a program. A Skill is markdown plus
settings. It cannot run code on your computer, because Archie has nowhere to run it."

**Why it's true:** No `std::process::Command`, no shell, no `dlopen`/`libloading`, no WASM,
no JS `eval` anywhere in `crates/` or `src-tauri/`. Tauri capabilities are deny-by-default
(`src-tauri/gen/schemas/capabilities.json`) and expose no shell, fs, or http permission to
the webview.

---

## What We Hold — state all three, always

**Approved wording:** "Our servers know three things about you: your email address, whether
your subscription is active, and which **paid** add-ons you've bought. Not your prompts, not
your files, not your calendar, not a single conversation. Free add-ons we can't see at all."

**Why all three:** Firebase Auth + the Firestore user doc hold email, uid, `access_tier`,
`subscription_status`, `stripe_customer_id` (`crates/archie-core/src/auth.rs:237-244`). The
Stripe webhook writes a permanent purchase record per paid item — item id, amount, session
id, timestamp (`stripe-webhook/index.js` → `users/{uid}/purchases/{item_id}`).

✅ **Resolved 2026-07-15.** The old falsehood ("the only thing our servers know is whether
your subscription is active") has been removed everywhere and replaced with the three-things
wording above. Now live correctly at `index.html:573`, `archie/index.html:275`,
`archie/install/index.html:186`, `faq/index.html:306`, `business/index.html:223`,
`privacy-policy/index.html:154`, `trust/index.html:296`. **Do not let the shorter,
false form return** — "email + subscription + paid add-ons" is the floor; never fewer.

---

## ⛔ Claims That Are FALSE Today — must not ship

### ✅ Calendar changes require your confirmation — SHIPPED, enforced in code (was ⛔ until 2026-07-20)

**Approved wording:** "When your agent wants to change a calendar you've connected — create,
move, or delete an event — it proposes the exact change and applies it only after you approve
it in a later message. Unattended routines can't apply calendar changes at all — they report
what they would make instead of making it."

**Why it's true:** every calendar write is staged, never executed, on the turn that proposes
it (`gateway.rs:2018-2049`). The apply/discard tools are only added to the tool set on a turn
where a proposal is already pending, so the model *cannot* apply a change in the same message
that proposed it (`gateway.rs:1963-1979`; snapshot rule documented at `gateway.rs:1946-1950`).
`calendar_apply_pending_change` applies the staged change verbatim and nothing else
(`gateway.rs:2051-2061`). The unattended routine path returns
`blocked_needs_user_confirmation` (`gateway.rs:2041-2047`) — the 3am-delete exploit chain this
file used to document is closed. Guarded by test (`gateway.rs:4617-4626`).

**Boundaries — do not overclaim:**
- The code enforces the **two-turn shape**: no same-turn apply, verbatim change only, no
  unattended writes. It does **not** semantically verify that your later message was a "yes" —
  the model judges that. Never write "the app checks that you said yes."
- Reads (`calendar_list_events`) are ungated. Say "changes," never "access."
- Keep the Trust page's honest-limit paragraph (an approval only protects you if you read it)
  wherever this claim anchors a section.

### ✅ Email goes out only when you tap Send — SHIPPED (was 🚧 roadmap until 2026-07-20)

**Approved wording:** "Archie can draft email replies, but it cannot send one on its own. The
draft comes to your chat as a card with Send / Edit / Dismiss buttons, and nothing reaches
Gmail until you tap Send."

**Why it's true:** the model's tool set contains **no email-send tool** (tool definitions in
`gateway.rs`: calendar, meetings, workers, knowledge, remember — nothing sends).
`gmail_send_reply` (`google.rs:279`) has exactly one caller: the "send" branch of the
button-callback handler, which requires a pending draft in `Pending` status
(`email/replies.rs:301-307,507`). Draft triage runs with **no tools** and frames the email as
untrusted input, so a prompt-injected message can at worst produce a bad draft you still have
to approve (`email/replies.rs:1-12`). The tap is authorized against the same inbound roster as
any message (`telegram.rs:917-925`). The `gmail.compose` scope is requested only if the user
ticks "send" at connect time (`commands.rs:3054-3059`); the base Gmail integration remains
read-only (test `gmail_requests_readonly_only`, `builtins.rs:673-679`).

**Boundaries — do not overclaim:**
- Sends are **replies threaded onto an existing message** (`google.rs:277-303`). No claim of
  composing fresh email from scratch until that ships.
- "Sequencing constraint" from the 07-15 entry was honored: the gate landed before/with send.

**Still true, unchanged:**
- **The agent cannot buy anything.** `archie-runtime` cannot see `archie-core::purchases`;
  purchases require a human in Stripe Checkout.
- **The agent only messages you** — `Channel::send` targets the owner's chat; the inbound
  roster (`access.rs`) governs who may talk *to* it.
- **`remember` is still ungated** — a local write; the persistence vector for an injected
  instruction. Disclose, don't hide.

| Claim | Status |
|---|---|
| "Archie asks before it changes anything in your calendar." | ✅ **True now** (two-turn gate) |
| "Nothing reaches Gmail until you tap Send." | ✅ **True now** (single-caller send path) |
| "Archie cannot spend your money." | ✅ True (and no purchase code path exists in the runtime) |
| "Works while you sleep. Checks in before it acts." | ✅ Defensible now: unattended writes are blocked, reported instead |
| "Every Skill tells you what it can do before you install it — including what it can delete." | 🚧 Still Phase 3 |
| **"Nothing sends without your OK"** (unscoped) | ⛔ **Still banned.** Chat replies and provider web-search queries leave without a per-item OK. Use the scoped calendar/Send-tap wordings above. |

### 🚧 Group-chat messaging + a "who it may message" UI — ROADMAP, NOT SHIPPED

Planned: group-chat messaging, and a UI for adding user IDs to a permitted-to-message list.
**Neither exists today.** Today the agent replies in the chat it was addressed in (the owner's
chat, or the learned primary chat); the only roster that exists governs who may talk **to** it
(`crates/archie-runtime/src/access.rs`), not who it may talk **to**.

✅ **The current copy is safe for both** — *"It speaks only in the chats you connect it to, to
people you've approved"* is true today and stays true after the UI lands. Do not upgrade it to
anything more specific until the UI exists.

### ✅ Email send with click-to-approve — SHIPPED 2026-07-20 (superseded)

See "**Email goes out only when you tap Send**" above for the approved wording, code pointers,
and boundaries. The 2026-07-14 inventory ("eleven tools, none sends email; zero buttons in any
chat adapter") is superseded: the model *still* has no send tool — sending is a user-tap
action on a draft card, not a model capability — and the chat adapters now carry inline
buttons for exactly this flow (`telegram.rs:672-729,917-925`). The sequencing constraint the
07-15 entry demanded (gate lands fail-closed before send) was honored.

### ⛔ The gate does not stop exfiltration — never imply it does

The gate stops **mutation**, not **leakage**. A prompt injection can still make the model issue
an Anthropic server-side web search (`gateway.rs:2263`) or a `delegate_to_worker` web-search call
(`gateway.rs:1395-1418`) with an attacker-chosen query carrying data from the user's context.
Neither is gateable at the choke point, because the search never becomes a client tool call.

**This must not be swept under a "nothing happens without your OK" umbrella.** Say so plainly on
the Trust page; we already do.

---

## Known Weaknesses — disclose, don't hide

These are true and unflattering. They go on the Trust page anyway.

### The subscription gate is fail-open — and this cuts both ways

The license check reads a cached Keychain value and **only writes on success**
(`src-tauri/src/auth.rs:147-198`). If the server is unreachable, the last known-good answer
stands — **with no TTL, no expiry, and no grace-period counter**.

Two consequences, and they pull in opposite directions:

1. ✅ **If Otian dies, existing installs keep working.** The check fails, the cache persists,
   the app runs indefinitely. This is what we want, and it is what the code does today.
2. ⚠️ **It is also a piracy hole.** Blocking `firestore.googleapis.com` after one successful
   sign-in yields permanent free access.

Cancellation still works as intended: Stripe → Firestore `access_tier` → the next *successful*
check flips the flag and the app stops. The gate only fails open when the **server** is
unreachable, not when the answer is "no".

⚠️ **The trap:** closing the piracy hole with a TTL would silently break consequence (1) — the
"if we vanish, your agent survives" promise. **So do not rely on the accident.** We have made it
a **contractual commitment** instead (Terms of Service → "Subscription, cancellation, and what
happens if we go away"): *if Otian ceases operations, we publish a final build requiring no
subscription check, within 30 days.* That promise survives any change to the license mechanism,
which means the piracy hole can now be fixed freely without touching the claim.

⛔ **Never claim a "30-day grace period" for an unreachable server.** No such timer exists.
✅ **Do claim:** "If you leave, the app stops. If we disappear, it doesn't." Backed by the Terms.

### Prompt injection: the gate narrows it, doesn't end it

Chat attachments (`discord.rs:377`, `slack.rs:334`), Fireflies meeting transcripts, and
provider web-search results still enter the model's context. Since 2026-07-20 the calendar
gate stands between injected content and calendar writes, and email triage is quarantined
(no-tools call, sanitized input — `email/replies.rs`). What remains reachable by an injected
instruction: **`remember`** (a local write — the persistence vector) and **provider-side web
search** (the exfiltration channel — see the gate-does-not-stop-exfiltration section). A bad
draft is also still possible; the Send tap is what stops it becoming a sent email.

---

## Banned Phrasings — never ship these

| Banned | Why |
|---|---|
| "Your data never leaves your device" | **False.** Your prompts go to Anthropic/OpenAI. The true claim is that *we* never see them. |
| "The only thing our servers know is whether your subscription is active" | **False.** Also your email and every paid add-on you own. |
| "Fully private" / "completely private" / "100% private" | Unfalsifiable. Means nothing. Say what we hold and what we don't. |
| "Zero data collection" | **False.** We collect your email. |
| "Bank-grade" / "military-grade" encryption | Meaningless. We use the OS Keychain and TLS. Say that. |
| "We can't see anything" | Overbroad. We can see three things. Name them. |
| "Nothing sends without your OK" (unscoped) | Chat replies and provider web-search queries leave without a per-item OK. Use the scoped forms: calendar-confirmation / Send-tap wordings. |
| "Sandboxed add-ons" | Misleading. Add-ons are data, not code — there is nothing to sandbox. The true claim is *stronger*; make it instead. |
| "Your keys never leave your computer" / "keys stay on your machine" | **False.** The key is sent to Anthropic/OpenAI as a request header on every call (`secrets.rs`, `x-api-key`/bearer). The true claim is storage + custody: "keys sit in your system's keychain, where we have no way to read them." |
| "We never hold your data" (unscoped) | Unscoped "your data" is false — we hold email + license + paid add-ons. Scope to content: "We never hold your conversations." Caught 2026-07-20 on the homepage proof chip. |
| "It asks before it acts" / "acts only with your approval" (unscoped) | Same umbrella as "nothing sends without your OK": chat replies, provider web search, `remember`, and calendar reads act without asking. Use the scoped Send-tap / calendar-changes forms. |

---

## Settled Decisions

### Business Tier — what an admin can see

**Decided 2026-07-14. Binding on the build. Not to be published until the tier ships.**

An admin sees exactly three things: **which teammates have an agent, which add-ons are
installed, and what it costs** — plus the ability to revoke a seat.

An admin sees **zero content**: not what was asked, not what was read, written, or sent.

This must be enforced by architecture, not by a policy toggle — because a toggle can be
flipped, and a promise not to look is worth nothing. The published sentence, when it ships:

> Your manager can see that you have an agent, which add-ons it has, and what it costs.
> Your manager cannot see what you asked it, what it read, what it wrote, or what it did —
> not because we choose not to show them, but because that never leaves your machine.
> We don't have it to show.

**Corollaries:**
- Every employee gets a **"what your admin sees"** screen showing the exact payload their
  machine reports. This is what stops a business rollout dying from the bottom up.
- This **kills the usage/savings dashboard** as specced. Hours-saved-per-employee is derived
  from activity; if we can't see activity, we can't compute it honestly. Do not build it.

### Subscription gating

Archie is gated by payment; we do not pretend otherwise. We do not market "runs forever"
and we do not claim a grace period. If the gate is ever made to fail *closed*, this section
gets rewritten and the Trust page's honest-limits section updated the same day.

---

## Change Process

1. A new claim requires a pointer to the code path that makes it true. No pointer, no claim.
2. A claim whose code path is deleted or changed is **dead** until re-verified. Ripping out a
   feature means ripping out its copy in the same PR.
3. Re-run the full egress audit before any launch, funding round, or press push. The audit is
   the only thing standing between us and a claim that quietly went stale.
4. The owner named at the top has veto. Not consensus — veto.
