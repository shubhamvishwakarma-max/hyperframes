# Swiggy Business Loan × DoubleTick: Video Flow v2

**Target length:** ~2:40 (cuts to ~2:15 are listed at the end)
**Hero product:** DoubleTick **Voice AI agent** (the client asked for AI calling), with the **WhatsApp AI agent** as the follow-up channel
**Story:** One AI call → WhatsApp follow-up (two scenarios) → KYC → document collection → AI summary → Legal team

### Characters and data (all fictional, use dummy documents)

| | |
|---|---|
| Customer | **Ravi Kumar**, owner of **Ravi's Biryani House**, Hyderabad, Swiggy restaurant partner |
| WhatsApp number | ends in **3210** |
| AI (call and chat) | **Swiggy Business Loan**, the AI loan assistant (built on DoubleTick) |
| Loan | **₹5,00,000** for kitchen expansion (new tandoor and cold storage); eligible for up to **₹8,00,000\*** |
| Human who takes over | **Neha Sharma, Legal Team** |
| Application ID | **SBL-24817** |

\*Always shown with "Subject to verification by our lending partner." Swiggy facilitates the loan; a lending partner gives it.

---

## 1. Feedback → where it's fixed

| # | Feedback | Fixed in |
|---|---|---|
| 1 | Start with the AI call, not WhatsApp (the client asked for AI calling) | Scenes 1–2. The old order (WhatsApp → call) is reversed |
| 2 | Ravi owns Ravi's Biryani House and gets an AI call from Swiggy's team | Scenes 1–2 |
| 3 | Replace the call script with "Are you interested in a business loan? We can help you get a loan. Welcome to Swiggy Business Loan. What do you need this loan for?" | Scene 2. The AI also no longer says "this is Ravi": Ravi is the customer, so the AI addresses him by name |
| 4 | After the call, push the call details to WhatsApp | Scene 3 |
| 5 | Scenario 1: Ravi picks up, agrees, and gets a WhatsApp follow-up | Scenes 2–3 |
| 6 | Scenario 2: Ravi doesn't pick up, so the AI texts him on WhatsApp | Scene 4 |
| 7 | Show document collection on chat in addition to KYC (as in the Paraml video) | Scenes 5–6 |
| 8 | If a document is missing, the AI asks the customer and collects it | Scene 6 |
| 9 | Show PII masking | Scene 5 (masked values carry into Scenes 7–8) |
| 10 | Hand over to the **Legal team**, not an RM (an RM doesn't check documents) | Scene 7 |
| 11 | Remove the "AI → RM → doc-check team" chain. The AI summarises the whole conversation, stores it, and sends it to the team | Scene 7. The old collaborator relay is removed |
| 12 | The agent who receives the chat can bring others in | Scene 8 (optional collaborator beat) |

---

## 2. Flow at a glance

```
                 📞 Voice AI call: "Swiggy Business Loan"
                                 │
              ┌──────────────────┴──────────────────┐
     SCENARIO 1: picks up & agrees        SCENARIO 2: doesn't pick up
              │                                     │
   WhatsApp: call recap                  WhatsApp: "We just tried calling you"
   [Start application]                   [I'm interested] → AI asks purpose + amount
              └──────────────────┬──────────────────┘
                                 ▼
          WhatsApp AI agent: KYC (PAN, Aadhaar, bank a/c)   🔒 PII masked in inbox
                                 ▼
          Business documents: GST · FSSAI · 6-month bank statement
                                 ▼
          Missing or incomplete? AI asks Ravi → collects it on the same chat
                                 ▼
          AI conversation summary → saved to chat notes
                                 ▼
          Chat assigned to LEGAL TEAM (Neha) → she reviews docs with full context
                                 ▼
          (optional) Neha adds a collaborator, who opens the same summary
                                 ▼
          Ravi gets the update on the same WhatsApp chat
```

---

## 3. Scene by scene

> **Layout convention.** From Scene 2 onward, use a split screen: **left = Ravi's phone** (what the customer sees), **right = DoubleTick** (what Swiggy's team sees). The split is what lets the viewer see AI calling, PII masking and the handover together.

### Scene 1: Hook (0:00–0:05)

- **Visual:** Lunch rush in a biryani kitchen. Name board: *Ravi's Biryani House*. Ravi's phone lights up on the counter: **Incoming call · Swiggy Business Loan**.
- **Caption:** "Meet Ravi. Owner, Ravi's Biryani House. Swiggy restaurant partner."
- **Transition:** Ravi picks up and the frame splits.

### Scene 2: The AI call, Scenario 1: Ravi picks up (0:05–0:45)

- **Left (phone):** Call screen with live captions.
- **Right (DoubleTick, Calls, live):** `Swiggy Loan Assistant · Voice AI` · 🔴 Live 00:00 · chip `Language: Hinglish (auto-detected)`. A **Captured details** panel fills in as each line is spoken.

| Speaker | Line | DoubleTick field that fills in |
|---|---|---|
| AI | Hello, am I speaking with Ravi ji from Ravi's Biryani House? | |
| Ravi | Haan ji, bol raha hoon. *(Yes, speaking.)* | |
| AI | **Welcome to Swiggy Business Loan!** I'm Swiggy's AI loan assistant. **Are you interested in a business loan? We can help you get one.** | |
| Ravi | Haan, actually soch hi raha tha. *(Yes, I was actually thinking about it.)* | |
| AI | That's great. **What do you need this loan for?** | |
| Ravi | Kitchen expand karna hai: naya tandoor aur ek cold storage. *(I want to expand the kitchen: a new tandoor and a cold storage.)* | `loan_purpose: Kitchen expansion` |
| AI | Got it. How much would you need? | |
| Ravi | Around 5 lakh. | `loan_amount: ₹5,00,000` |
| AI | Based on your Swiggy sales, you may be eligible for up to ₹8 lakh, subject to document verification. Shall I send the next steps on your WhatsApp, on the number ending 3210? | `eligible_upto: ₹8,00,000` |
| Ravi | Haan, bhej do. *(Yes, send it.)* | `whatsapp_consent: Yes` |
| AI | Done! You'll get it in a few seconds. Thank you, Ravi ji. | `call_outcome: Interested` |

- **End of call:** "Call ended · 01:12"
- **Why the script is built this way:**
  - It keeps all four of the requested lines. "Welcome to Swiggy Business Loan" moves to the front because a real call greets the customer before pitching.
  - The AI says it's an AI assistant. That's standard practice, and DoubleTick's own sample call prompt has the agent identify itself as AI.
  - The AI says "may be eligible" and "subject to verification", never "approved", which is realistic for lending.
  - The AI asks before sending to WhatsApp. That consent is what justifies the next message.
- **Small UI chip (optional):** `🔴 Call recorded · AI disclosed`

### Scene 3: Call details pushed to WhatsApp (0:45–0:58)

- **Right (DoubleTick):** The live call card flips to a **Post-call** card:
  - `call_outcome: Interested ✅` · `meaningful_conversation: Yes`
  - `loan_amount: ₹5,00,000` · `loan_purpose: Kitchen expansion`
  - Action row animates in: **WhatsApp follow-up sent** · template `loan_call_followup`
- **Left (phone):** WhatsApp notification → chat with **Swiggy Business Loan**:

> Hi Ravi 👋 Thanks for speaking with us just now.
>
> Here's what we noted from your call:
> • Loan amount: ₹5,00,000
> • Purpose: Kitchen expansion (tandoor + cold storage)
> • Eligible up to: ₹8,00,000\*
>
> To move ahead, we need a few documents. It takes about 5 minutes, right here on WhatsApp.
>
> **[ Start application ]** **[ Call me later ]**
>
> \*Subject to verification by our lending partner.

- **Caption:** "Call details on WhatsApp, in seconds."
- **Hold:** Don't tap the button yet. Rewind first.

### Scene 4: Rewind, Scenario 2: Ravi misses the call (0:58–1:20)

- **Transition:** ⏪ Rewind effect back to the ringing phone.
- **Caption:** "Same call. But this time, Ravi's busy at the tandoor."
- **Left (phone):** The phone rings on the counter and nobody answers. **Missed call · Swiggy Business Loan**.
- **Right (DoubleTick):** `Call status: Not answered` → action row: **WhatsApp nudge sent** · template `loan_missed_call`
- **Left (phone):** WhatsApp message:

> Hi Ravi 👋 We just tried calling you from Swiggy Business Loan.
>
> Good news: Ravi's Biryani House may be eligible for a business loan of up to ₹8,00,000\*.
>
> Busy in the kitchen? No problem. Reply here whenever you're free.
>
> **[ I'm interested ]** **[ Call me back ]** **[ Not now ]**
>
> \*Subject to verification by our lending partner.

- **Time-jump chip:** "4:30 PM, after the lunch rush." Ravi taps **I'm interested**.
- **WhatsApp AI agent replies.** This is the same conversation as the call, now on chat:

> **AI:** Welcome to Swiggy Business Loan, Ravi ji! 😊 What do you need this loan for?
> *List options:* Kitchen / equipment · New outlet · Inventory / working capital · Something else
>
> **Ravi taps:** Kitchen / equipment
>
> **AI:** And how much do you need?
>
> **Ravi:** 5 lakh

- **Merge visual:** Two lines, 📞 *Picked up* and 📵 *Missed*, converge into one WhatsApp chat icon.
- **Caption:** "Picked up or missed: every lead lands in the same WhatsApp chat, with the same context."
- **Hand-off to the next scene:** Return to the Scenario 1 chat and have Ravi tap **[ Start application ]**. Both paths continue identically from here.

### Scene 5: KYC on chat, with PII masking (1:20–1:40)

- **Left (phone, Ravi's view):**

> **AI:** Let's start with a quick KYC 🪪 Please share:
> 1. PAN card
> 2. Aadhaar card (front & back)
>
> **Ravi:** *(sends 3 photos)*
>
> **AI:** ✅ PAN received: name matches your Swiggy account (Ravi Kumar)
> ✅ Aadhaar received
>
> Which bank account should the loan be credited to?
>
> **Ravi:** HDFC 50100234567712

- **Right (DoubleTick team inbox, Swiggy's view):** The same messages, protected:
  - Photos appear with the ID numbers **blurred**
  - Ravi's text appears as **HDFC XXXXXXXXXX7712**
  - Aadhaar is referenced as **XXXX XXXX 4821**
  - Badge: `🔒 PII protected · Enterprise Security`
- **Key visual moment:** Hold the split for a beat so the viewer sees the same message clear on Ravi's phone and masked in the inbox.
- **Caption:** "Your team sees only what it needs. Sensitive data is masked automatically."
- **Don't** mask anything on Ravi's phone. Masking happens on the business side; the customer always sees his own documents normally.

### Scene 6: Document collection and missing-document recovery (1:40–2:04)

- **Left (phone):**

> **AI:** Now your business documents 📄
> 1. GST certificate
> 2. FSSAI license
> 3. Bank statement for the last 6 months (May–Oct)
>
> **Ravi:** *(sends 2 files)* `GST_Certificate.pdf` · `HDFC_Statement_Aug-Oct.pdf`

- **Right (DoubleTick):** A document checklist card animates as the AI reads each file:
  - ✅ GST certificate: received
  - ⚠️ Bank statement: covers **Aug–Oct only** (3 of 6 months)
  - ❌ FSSAI license: **not received**
- **Left (phone):**

> **AI:** Almost done, Ravi ji! 2 things are pending:
> • FSSAI license
> • Bank statement for May–Jul
>
> Send a PDF or a clear photo, whatever's easy.
>
> **Ravi:** Ek minute 👍 *(sends)* `FSSAI_License.jpg` · `HDFC_Statement_May-Jul.pdf`
>
> **AI:** ✅ All documents received! Your application ID is **SBL-24817**. Our legal team will verify everything and update you right here.

- **Right:** The checklist turns all green.
- **Caption:** "Missing document? The AI spots it and asks. No human chasing."
- **Why these documents:** PAN, Aadhaar, GST, FSSAI and bank statements are a realistic set for a restaurant MSME loan. FSSAI is the food-business license, which makes this feel specific to a restaurant rather than generic.

### Scene 7: AI summary and handover to Legal, not an RM (2:04–2:20)

- **Right (DoubleTick inbox, full screen):** A **Conversation summary · generated by AI** card types in line by line:

> **Customer:** Ravi Kumar · Ravi's Biryani House, Hyderabad · Swiggy partner
> **Journey:** AI call (01:12, Interested) → WhatsApp application
> **Request:** ₹5,00,000 business loan · Kitchen expansion (tandoor + cold storage) · Eligible up to ₹8L\*
> **KYC:** PAN ✅ · Aadhaar ✅ (XXXX XXXX 4821) · Bank a/c HDFC XXXXXXXXXX7712
> **Documents:** GST ✅ · FSSAI ✅ *(collected on follow-up)* · Bank statement May–Oct ✅ *(May–Jul collected on follow-up)*
> **Next step:** Legal verification of documents

- Two confirmations tick in after the card:
  1. `✓ Summary saved to chat notes`
  2. `✓ Chat assigned to Legal Team · Neha Sharma`
- **Caption:** "No RM relay. The AI summarises the entire conversation, saves it, and hands the chat to the Legal team."
- **Remove from the old cut:** The "AI → RM → RM forwards to doc-check team" sequence. The summary carries the context; no person in the middle passes the chat along.

### Scene 8: The Legal team takes over with full context (2:20–2:32)

- **Right (Neha's view):** She opens the chat with the AI summary pinned on top and the documents in the side panel (PII still masked). She ticks each document as verified.
- **Optional 3-second beat:** Neha → **Collaborators** → **Add collaborator** → *Arjun · Legal Team* (second reviewer). Arjun opens the chat and sees the same summary and history, with no re-briefing.
- **Left (phone):**

> **Neha (Legal Team):** Hi Ravi, this is Neha from the Swiggy Business Loan legal team. Your documents are verified ✅ Your application is now with our lending partner for final approval, and you'll get the sanction letter right here on WhatsApp.
>
> **Ravi:** Thank you so much! 🙏

- **Caption:** "Same chat. Full context. Nobody asks Ravi to repeat himself."

### Scene 9: Outro (2:32–2:42)

- **Recap strip** (icons light up left to right):
  📞 AI call → 💬 WhatsApp follow-up → 🪪 KYC → 📄 Documents → 🧠 AI summary → ⚖️ Legal team
- **Tagline:** "One AI call. One WhatsApp chat. Zero manual follow-ups."
- **End card:** DoubleTick logo · "Voice AI + WhatsApp AI Agents" · CTA

---

## 4. Keeping it realistic on DoubleTick

These are DoubleTick's own feature names and behaviours, so the UI on screen matches the product.

| What's on screen | How DoubleTick does it | Detail to get right |
|---|---|---|
| AI call | **Voice AI agent**, outbound over the regular phone network (PSTN) or WhatsApp calling, with a configurable first message for outgoing calls | Multilingual with language detection, so Ravi answering in Hinglish is realistic |
| Captured details on the call | **Post-call metrics**. Defaults are `call_outcome` (Interested / Not interested / Callback requested) and `meaningful_conversation` (Yes/No); custom fields can be added | Use `loan_amount`, `loan_purpose` and `whatsapp_consent` as the custom fields |
| Missed call | Not a `call_outcome` value, because those apply to connected calls | Show it as call status **Not answered**, not as an outcome |
| WhatsApp follow-up | Business-initiated messages must use an **approved template**. A button tap opens the 24-hour window, and then the AI agent can chat freely | `loan_call_followup` reads as Utility (recap of a call he agreed to); `loan_missed_call` is Marketing (an offer) |
| Call → WhatsApp trigger | DoubleTick says call outcomes are logged and follow-ups are scheduled automatically; the Voice AI setup also has post-call webhooks | ⚠️ **Confirm with the product team** which screen shows "outcome → send template" before animating a specific settings UI. Don't invent one; the action-row card in Scenes 3–4 is safe |
| PII masking | **Enterprise Security** (Enterprise plan): masks text (DoubleTick's example: `9876543210` → `XXXXXXXX10`), blurs media, or rejects the message. Checked in real time before content is saved or shown | Mask only on the business side, never on Ravi's phone |
| Summary | **AI Copilot conversation summaries**, saved in the chat's **Notes** section | |
| Handover | **Assign chat** to a team or agent; the AI agent hands off to humans when needed | Assign to *Legal Team*, never to an RM |
| Bringing others in | **Collaborators** see the full conversation history and can reply | |
| Lending language | Swiggy facilitates and a lending partner lends | "May be eligible", "subject to verification", "final approval by lending partner". Never "loan approved" from the AI |

---

## 5. One thing to confirm with your manager

The feedback says both **"AI hands over the chat to the internal legal team"** and **"the agent can then bring in the doc-check team."** This flow treats **Legal = the team that checks documents** (the feedback also says "legal team checks documents"), so the AI hands straight to Legal, and the optional collaborator beat in Scene 8 brings in a second Legal reviewer.

If they meant that a **loan-desk agent** receives the chat first and then adds Legal as a collaborator, change two things:
- Scene 7: assign to *Loan Desk · \<agent\>*
- Scene 8: that agent adds *Legal Team* as a collaborator, and Neha opens the same summary

Either way, the summary is the hero and there's no RM relay.

---

## 6. Cuts if you need ≤ 2:15

1. **Scene 4:** Skip the list-message step. Ravi taps *I'm interested* and the chat merges straight into Scene 5. Saves ~6s.
2. **Scene 5:** Drop the bank-account question. Show masking only on the blurred PAN/Aadhaar photos. Saves ~5s.
3. **Scene 8:** Drop the collaborator beat. Saves ~3s.
4. **Scene 2:** Merge "How much would you need?" into the purpose question. Saves ~4s.
5. **Scene 9:** Shorten the recap strip to 5s. Saves ~5s.
