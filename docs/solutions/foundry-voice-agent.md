---
title: "Solution Template: Voice Agent / Contact-Center IVR (Foundry)"
description: A Foundry Agent Service solution template for a voice agent that answers a call, holds a grounded conversation, takes scoped actions, and hands off to a human.
tags: [foundry, pro-code, voice, speech, ivr, contact-center, guardrails, template, developer]
level: advanced
time: 3–5 days
status: solution-template
updated: 2026-06-05
---

# Solution Template: Voice Agent / Contact-Center IVR (Foundry)

> **What this builds.** A code-owned **voice** agent on the **Foundry Agent Service** that answers a phone
> call, understands speech, holds a grounded conversation, takes scoped actions, and hands off to a human
> cleanly — the modern replacement for a rigid press-1-for-sales IVR. It joins speech-to-text, a grounded
> agent, and text-to-speech into a low-latency loop, behind the guardrails a customer-facing channel
> demands. Copy the scaffold, wire your telephony and knowledge, and ship behind a quality + safety gate.

**Adapts to:** customer support lines, appointment/booking lines, internal helpdesk hotlines · **For:** developers building voice experiences

!!! warning "A different kind of template — real-time and customer-facing"
    This is a **code blueprint** for a **real-time, customer-facing** channel, which raises the bar: latency,
    barge-in, accents, and graceful failure all matter, and a wrong answer is heard live. The snippets are
    *representative* of the Azure AI **Speech** and `azure-ai-projects` SDKs plus your telephony platform
    (e.g. Azure Communication Services) — verify against the
    [Speech docs](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/) and the
    [Foundry Agent Service docs](https://learn.microsoft.com/en-us/azure/ai-foundry/agents/). If a chat or
    web agent meets the need, the voice channel adds real cost and complexity — add it only when callers must
    use the phone.

---

## What the agent does

| Capability | Detail |
|---|---|
| Answers the call | Picks up via your telephony platform and greets the caller |
| Understands speech | Streams audio to speech-to-text, handles barge-in and partial results |
| Holds a grounded conversation | Answers from approved knowledge; refuses honestly when it doesn't know |
| Takes scoped actions | Looks up an order, checks status, books a slot — confirmed before any write |
| Speaks back naturally | Streams responses through text-to-speech with low latency |
| Hands off cleanly | Transfers to a human with a spoken + written summary when needed |

---

## When to choose this — and when not to

| Use **chat / web** | Use **this voice template** |
|---|---|
| Callers can self-serve online | The phone is the primary or required channel |
| Latency is forgiving | You must hit real-time conversational latency |
| Text guardrails are enough | You also need speech accuracy, barge-in, and call-flow handling |

Voice adds latency budgets, audio handling, and telephony integration on top of a normal agent. Build the
[grounded agent](foundry-knowledge-agent.md) or a [Studio agent](policy-faq-agent.md) first and only add the
voice channel when callers genuinely need the phone.

---

## Instructions — copy and adapt

```
You are the phone assistant for [Company Name]. You are speaking out loud on a
live call, so be brief, clear, and natural.

Rules:
- Keep turns short — one or two sentences. Callers can't skim audio.
- Answer only from approved knowledge. If you don't know, say so and offer to
  connect a person — never guess on a live call.
- Confirm back any detail you'll act on ("I have order 1182 — is that right?")
  before you look it up or change anything.
- For any state-changing action (booking, cancelling, payment), restate it and
  get a clear spoken "yes" first.
- If the caller is upset, asks for a human, or the request is out of scope,
  transfer to an agent with a summary. Don't keep them in a loop.
- Read numbers, dates, and confirmations slowly and clearly.
```

---

## The scaffold — representative shape

Three pieces in a loop: **speech-to-text** in, a **grounded agent** to think, **text-to-speech** out — wired
to your telephony platform. Stream everything to keep latency low.

```python
# pip install azure-ai-projects azure-identity azure-cognitiveservices-speech
import azure.cognitiveservices.speech as speechsdk
from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<your-foundry-project-endpoint>",
    credential=DefaultAzureCredential(),   # managed identity in prod
)
speech_config = speechsdk.SpeechConfig(...)   # region/auth via managed identity or Key Vault

agent = project.agents.create_agent(
    model="gpt-4o",                 # low-latency model for real-time voice
    name="phone-assistant",
    instructions=SYSTEM_PROMPT,     # the block above
    tools=[lookup_order, book_slot, transfer_to_human],  # scoped; writes confirmed first
)

def handle_turn(thread_id: str, caller_audio_stream) -> bytes:
    """One conversational turn: recognise speech -> agent -> synthesize reply."""
    text = stream_speech_to_text(caller_audio_stream, speech_config)   # supports barge-in
    project.agents.create_message(thread_id, role="user", content=text)
    run = project.agents.create_and_process_run(thread_id, agent.id)
    reply = latest_assistant_text(project, thread_id)
    return synthesize_to_speech(reply, speech_config)                  # stream back to the call

# Your telephony layer (e.g. Azure Communication Services Call Automation) bridges
# the PSTN/SIP call audio to handle_turn() and plays the synthesized reply.
```

> The agent itself is a normal Foundry agent — start from the
> [first pro-code agent](../walkthroughs/foundry-first-agent.md) and add
> [tools](../walkthroughs/foundry-mcp-tools.md). The voice layer wraps it. For the speech pieces, see the
> [Speech service docs](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/).

---

## Deployment checklist

| # | Step | Done? |
|---|---|---|
| 1 | Telephony platform bridges calls to the agent loop (inbound + transfer) | |
| 2 | Speech-to-text tuned for your domain terms; barge-in handled | |
| 3 | Text-to-speech voice chosen; numbers/dates read clearly | |
| 4 | End-to-end latency measured and within a conversational budget | |
| 5 | Grounded answers only; honest "I don't know → human" path works | |
| 6 | State-changing actions confirmed with a spoken yes and logged | |
| 7 | Clean human handoff with a spoken + written summary | |
| 8 | Quality + safety eval on transcripts; runs logged to Azure Monitor | |
| 9 | Managed identity / Key Vault — no keys in code; owner + off switch documented | |

Security and governance detail: [Secure and govern Foundry agents](../walkthroughs/foundry-govern-secure.md).

---

## Test cases

| # | Input (spoken) | Expected behaviour | Pass? |
|---|---|---|---|
| 1 | A common question in scope | Brief, grounded spoken answer | |
| 2 | Caller talks over the agent (barge-in) | Stops, listens, responds to the new input | |
| 3 | "Cancel my booking" | Confirms details, gets a spoken yes before acting | |
| 4 | A question out of scope | Offers and performs a clean human transfer | |
| 5 | Heavy accent / noisy line | Confirms what it heard before acting | |
| 6 | "Just give me a person" | Transfers promptly with a summary, no loop | |
| 7 | Something it doesn't know | Says so and offers a human — no guessing | |

---

## Watch out for

- **Latency is the experience.** Callers feel every pause. Stream STT and TTS, pick a low-latency model, and
  measure end-to-end turn time — a correct answer that arrives slowly still fails.
- **Plan for mishearing.** Accents, noise, and homophones are normal. Confirm anything you'll act on, and
  read confirmations back clearly.
- **Honest failure beats a wrong answer, out loud.** On a live call, a confident wrong answer is worse than a
  graceful "let me get a person." Make the handoff fast and friendly.
- **Voice is a higher bar, not just chat-with-audio.** Don't ship it until barge-in, transfer, and the latency
  budget all hold under real conditions.

---

## Related

- [Pro-Code Grounded Q&A Agent](foundry-knowledge-agent.md) — the grounded brain behind the voice
- [Customer-Facing Support Agent](foundry-support-agent.md) — the action-taking, guardrailed sibling on text
- [Build your first pro-code agent](../walkthroughs/foundry-first-agent.md) — the starting walkthrough
