# ADR-017 · Keep conversation optional

**Context.** I wanted staff to answer in the mood of each room without needing spoken dialogue or a live model for the class demo.

**Decision.** Offer optional written conversations with three staff members. Author fallback replies and keep the OpenAI key on the server when live generation is enabled.

**Consequence.** All routes work without an API key. Codex checked fallback responses. The recorded demo uses the ordinary game route and hides the talk prompt.

[AI Use Log](../build-record/ai-use-log.md)
