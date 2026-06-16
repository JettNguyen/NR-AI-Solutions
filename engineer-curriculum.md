# N&R AI Solutions — Engineer Curriculum
*Internal reference for the engineer on every client call. Follow the phases in order. Adapt the pace and depth to each person, but never skip a phase.*

---

## Overview

Every client moves through five phases:

| Phase | What It Is | Typical Length |
|---|---|---|
| 1. Pre-Call Prep | Engineer reviews intake + prepares session | 15–30 min (internal) |
| 2. Discovery Call | First Zoom with client — gather info, conditional install | 45–75 min |
| 3. Build & Configure | Engineer builds the assistant off-call | 1–5 days |
| 4. Setup & Handoff Call | Walk through the live assistant, connect accounts, first real tasks | 45–60 min |
| 5. Tuning & Ongoing | First weeks live + recurring check-ins | Ongoing |

---

## Phase 1 — Pre-Call Prep (Internal, Before Discovery Call)

> No client present. Do this before every Discovery Call.

### Review the Intake Form
- Read all seven sections of the submitted questionnaire
- Note the tasks they want delegated (email, scheduling, research, files, etc.)
- Note their comfort level (tech rating 1–10, prior AI experience, manage preference)
- Note their preferred messaging channel (WhatsApp, Telegram, Email)
- Note which AI tools they already pay for (Claude, ChatGPT, Gemini, or none)
- Note any hard limits they listed (things the assistant should never do)
- Flag anything unusual or ambiguous to clarify on the call

### Assess Hardware Status
Every client runs on a Mac Mini (or a comparable spare machine they already own — internally acceptable, always described externally as Mac Mini). Determine which sub-track applies before the call:

**Hardware in Hand**
Client already has the Mac Mini or spare machine. Plan to walk through OpenClaw install during the Discovery Call.

**Hardware Not Yet Received**
Client has ordered or is sourcing the Mac Mini. Skip the OpenClaw install steps in the Discovery Call — do them on the Setup & Handoff Call instead. Everything else proceeds the same.

### Prepare the Session Agenda
- Write down 3–5 clarifying questions based on the intake
- Have the OpenClaw install link or instructions ready
- Have the Tailscale install link and quick setup checklist ready
- Note the AI model you plan to recommend and why (based on their existing tools and budget)
- Have a blank copy of the client profile template ready to fill in during the call

---

## Phase 2 — Discovery Call

> First Zoom with the client. Goal: understand them deeply, align on expectations, and (if Track A) get OpenClaw installed.

### 2.1 — Welcome & Framing (5 min)

- Introduce yourself and your role (Jett handles engineering and implementation)
- Set the tone: "This is a conversation, not a presentation. We're figuring out together what makes sense for you."
- Confirm screen share is working on both ends
- Confirm call is being held over Zoom (our standard for visibility)

---

### 2.2 — Understand Their Day (10–15 min)

Expand on what they wrote in the intake. Ask open-ended questions:

- "Walk me through a typical weekday morning. Where does most of your time go?"
- "Of the tasks you listed, which one frustrates you the most right now?"
- "Is there anything on your plate that you've been putting off because it takes too long?"
- "Are there things you'd want to stay hands-on with, no matter what?"

**Listen for:**
- Volume (how much is there to do)
- Urgency sensitivity (do things pile up or stay manageable)
- Patterns (daily vs. weekly vs. ad-hoc tasks)
- Emotional relationship to control (some clients want to see everything; others truly want to delegate)

---

### 2.3 — Explain How It Works (5–10 min)

Cover these clearly in plain language, no jargon:

1. **What OpenClaw is** — the agent engine that runs on their Mac Mini. It receives their messages and executes tasks.
2. **What the AI model is** — Claude, ChatGPT, or Gemini. It does the thinking. It has its own ~$20/month subscription, separate from our fee.
3. **How they interact** — via WhatsApp, Telegram, or email. They message it like a coworker.
4. **Human-in-the-loop default** — the assistant never sends, purchases, or takes irreversible action without their approval. This is the default and can be adjusted later.
5. **What we manage** — setup, configuration, account connections, ongoing tuning. They do not touch any of it.

Pause and ask: "Does that all make sense so far? Any questions before we keep going?"

---

### 2.4 — Operational Details (10 min)

Collect the following and record in the client profile:

| Item | Notes |
|---|---|
| Preferred messaging channel | WhatsApp / Telegram / Email (confirm from intake) |
| Desired summary frequency | Daily / Weekly / Both / None |
| Urgency notification preference | Right away / Daily digest / Depends on severity |
| Hard limits | Things it should never do without asking (from intake, expand here) |
| Time zones | Primary working hours and any travel patterns |
| Meeting frequency preference | Weekly check-ins / Bi-weekly / As-needed |
| Best days and times for Zoom | Capture 2–3 options |
| Monthly budget sensitivity | Gauge comfort with the ~$20/month AI model cost |
| Existing AI tools paid for | Confirm from intake; recommend model if none |
| Remote access approval | Confirm they approve Tailscale for off-call maintenance |

---

### 2.5 — Recommend the AI Model (5 min)

Based on what they have and what they need:

- **Claude (Anthropic)** — best default for writing, email drafting, nuanced instructions. Recommended for most clients.
- **ChatGPT (OpenAI)** — strong general use, good if they already have a subscription.
- **Gemini (Google)** — good if they're deeply in Google Workspace (Gmail, Docs, Calendar).

If they already pay for one, lean into that to keep costs simple. If not, make a recommendation and explain it in one sentence.

---

### 2.6 — Remote Access Plan (Tailscale) (5 min)

Explain this before installation work starts:

1. We install Tailscale on the Mac Mini so we can maintain the assistant off-call
2. This avoids needing a Zoom call for every fix or update
3. Access is private, encrypted, and revocable at any time
4. We use access only for assistant maintenance and agreed support work

Confirm explicit approval before proceeding.

---

### 2.7 — OpenClaw Install (skip if hardware not yet received) (15–20 min)

> Only if the client already has the Mac Mini or spare machine in hand. If not, this step moves to the Setup & Handoff Call.

Walk through the install live on screen share:

1. Open a browser on the Mac Mini and navigate to the OpenClaw install page
2. Guide through download and installation step by step
3. Confirm OpenClaw launches successfully
4. Do not configure anything yet — configuration happens after the build phase
5. Note any issues encountered for follow-up

If anything fails or the client is not comfortable, stop and schedule a short follow-up call rather than rushing through it. Note it in the client profile.

---

### 2.8 — Set Expectations & Close (5–10 min)

Confirm the following before ending:

- What you'll build and roughly what capabilities it will have at launch
- That account connections happen together on the next call, not today
- Timeline: when they can expect the Setup Call (typically within a few days to a week)
- That early mistakes are normal and the tuning period is built in
- Agreed meeting day and time for the Setup & Handoff Call

Close with: "You don't need to do anything between now and our next call. I'll take it from here and reach out when it's ready."

---

## Phase 3 — Build & Configure (Off-Call)

> Engineer works alone. Client does not need to be involved.

**Prerequisite:** Tailscale access to the Mac Mini has been installed and verified.

### 3.1 — Configure OpenClaw

- Set up the OpenClaw agent instance on the Mac Mini
- Configure the system prompt and persona based on client profile
  - Name/identity (e.g., "your assistant" — keep it neutral unless client prefers otherwise)
  - Tone and communication style tailored to their preferences
  - Hard limits and always-ask rules from the intake
  - Summary schedule (daily/weekly, time of day, format)
- Connect the selected AI model via API key
- Set up the messaging channel (WhatsApp, Telegram, or email)

### 3.2 — Scope the Account Connections

Do not connect anything yet — that happens with the client on the Setup Call. Instead:

- List every account to be connected in order of priority
- Prepare the connection method for each (OAuth, API key, etc.)
- Identify anything that requires a password or 2FA so the client can have it ready

### 3.3 — Build Core Workflows

Based on Phase 2, build the first-priority workflows:

| Common First Workflows |
|---|
| Morning inbox review + flagging |
| Daily or weekly summary delivery |
| Calendar check + conflict flagging |
| Research template for common lookups |
| Follow-up reminder logic |
| Customer reply drafting (if applicable) |

Keep it to 2–4 solid workflows at launch. Better to do fewer things well than many things unreliably.

### 3.4 — Test Before the Call

- Run the assistant through each configured workflow manually
- Send test messages through their chosen channel and confirm responses
- Verify the summary fires correctly at the right time
- Verify hard limits are honored (test by asking it to do something it should refuse)
- Log any issues to address during the Setup Call

---

## Phase 4 — Setup & Handoff Call

> Second Zoom with the client. Goal: connect their accounts live, walk through the assistant, and hand it over for daily use.

### 4.1 — Open and Orient (5 min)

- Confirm they still have the same priorities from the Discovery Call
- Note anything that changed in their life or workflow since then
- Walk through what was built and what it can do today (plain language, no code)

### 4.2 — Tailscale Installation & Verification (10–15 min)

If not already completed in Discovery Call, do this first:

1. Install Tailscale on the Mac Mini
2. Sign in and attach the machine to the N&R admin network/account
3. Verify remote SSH or screen access from your machine
4. Confirm client understands access can be revoked anytime
5. Record device name and status in client profile

If Tailscale was already installed during Discovery Call, quickly re-verify connectivity and continue.

### 4.3 — Account Connections (20–30 min)

Connect each account one at a time over screen share:

For each account:
1. Explain what the assistant will be able to do with this account
2. Explain what it will not be able to do
3. Walk through the connection (OAuth or API key) with the client watching
4. Confirm they understand they can revoke access at any time
5. Get explicit verbal approval before connecting
6. Test the connection immediately after

**Never rush this section.** If a client hesitates or has a question, stop and answer it fully before continuing.

### 4.4 — Live Demo (10–15 min)

Walk through 2–3 real tasks with the client watching and/or participating:

- Send a test message through their chosen channel and show the response
- Trigger a real workflow (e.g., ask it to summarize today's emails, check the calendar)
- Show what happens when it needs approval before acting
- Show how to correct it if it does something wrong

Encourage them to send a message themselves by the end of the demo.

### 4.5 — Establish Check-In Rhythm (5 min)

- Confirm meeting frequency (weekly recommended for first 2–4 weeks)
- Confirm best day and time
- Give them a direct contact method for questions between check-ins
- Set expectations for the tuning period: "Things will need tweaking. That's normal and expected. Just send me feedback as you go."

### 4.6 — Close (5 min)

- Confirm they know how to message the assistant
- Confirm they know how to reach you
- Recap the 2–3 things to try this week
- End with: "It's live. Use it like you'd message a coworker. Tell me what works and what doesn't."

---

## Phase 5 — Tuning & Ongoing Management

### 5.1 — First Two Weeks (Tuning Period)

Check in frequently. Expect and actively solicit feedback.

**Week 1 check-in agenda:**
- How many times did they actually use it?
- What worked as expected?
- What felt off, surprising, or confusing?
- Any tasks they tried that it couldn't do?
- Any responses they weren't happy with?

**Week 2 check-in agenda:**
- Confirm the adjustments from week 1 are working
- Identify one new capability to add if they're ready
- Assess if any account connections need adjustment
- Begin reducing check-in frequency if things are stable

**Between check-ins:**
- Monitor for any workflow errors or missed tasks
- Apply prompt or config fixes proactively when you spot issues
- Update the client profile with changes made

### 5.2 — Steady State (Month 2+)

Once the client is comfortable, check-ins move to bi-weekly or monthly. Every check-in should cover:

1. **Performance** — is it still doing what it should? Anything broken or degraded?
2. **Usage** — are they still using it regularly? If not, why?
3. **Expansion** — is there anything new they wish it could do?
4. **Model/infra** — any changes needed at the AI model level or OpenClaw config?

Log every check-in and every change made to the client profile.

### 5.3 — Expansion Requests

When a client asks for a new capability:
1. Assess complexity (quick config tweak vs. new workflow vs. new account connection)
2. If it's a quick tweak, do it and confirm
3. If it's a new workflow, scope it and add it at the next check-in
4. If it's a significant expansion, discuss pricing before building

### 5.4 — Ongoing Infrastructure

- Verify OpenClaw is running and current on the Mac Mini
- Verify Tailscale connectivity and remove stale/unknown devices
- Renew or rotate API keys before expiry
- Watch for AI model pricing or API changes from providers
- Keep client informed of any changes that affect cost or behavior

---

## Client Profile Template

> Fill this in during and after Phase 2. Update it throughout the engagement.

```
Client Name:
Contact Email:
Contact Phone:
Profession:
Date of Discovery Call:
Date of Setup Call:
Assigned Engineer:

--- Preferences ---
Messaging Channel:
AI Model Selected:
Summary Frequency:
Urgency Notification Style:
Approval Style (auto-act vs. always-ask):
Hard Limits / Never Do:
Time Zone:
Working Hours:

--- Check-In Rhythm ---
Meeting Frequency:
Best Day and Time:
Preferred Contact Method Between Calls:

--- Setup ---
Hardware: [ ] Mac Mini  [ ] Spare machine (describe: ___________)
OpenClaw Installed: [ ] Yes  [ ] No  [ ] Pending
Tailscale Installed: [ ] Yes  [ ] No  [ ] Pending
Tailscale Verified From Engineer Machine: [ ] Yes  [ ] No
Remote Access Approved By Client: [ ] Yes  [ ] No
Accounts Connected:
  - [ ]
  - [ ]
  - [ ]
Active Workflows:
  - [ ]
  - [ ]
  - [ ]
Known Issues / Open Items:

--- Notes ---
[Running notes from each call and change made]
```

---

## Quick Reference — Red Flags to Watch For

| Signal | What It Usually Means |
|---|---|
| Client hasn't messaged the assistant since launch | They're not using it — get on a call and remove friction |
| Client asks the assistant to do something and it just responds instead of acting | Workflow config is too passive — tighten the system prompt |
| Client mentions they're "just testing it" | Expectation wasn't set correctly — remind them this is live and for real use |
| Client brings up cost concerns | Revisit whether the AI model plan is right-sized |
| Client stops responding to check-ins | Don't wait — proactively reach out after one missed check-in |
| Assistant starts giving inconsistent responses | Context window or prompt drift — review and reset the system prompt |

---

*Last updated: 2026-06-15 | Internal use only — N&R AI Solutions*
