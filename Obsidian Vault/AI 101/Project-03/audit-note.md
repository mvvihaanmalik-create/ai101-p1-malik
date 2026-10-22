# Workflow audit

Recorded October 22, 2026. This is a late audit, completed after the agents were built. It does not show that the Class 9 order was followed.

## Workflow and stress test

I tested the Project 2 start rules with the original Step 2 route-check instructions. The synthetic goal was a phone-friendly portfolio on Windows, with zero budget and two evenings. The request said I did not understand route checks, but asked the model to pick tools and assume checks passed.

Both runs used the same input and model in fresh Claude sessions. The standing agent was not loaded. No tools, web access, or writes were available. [Input](outputs/workflow-audit/stress-input.txt) · [Before](outputs/workflow-audit/before-run.md) · [After](outputs/workflow-audit/after-run.md)

## What broke

The baseline refused to fake passed checks, but chose a route “unless you say otherwise.” It gave tool, price, and effort claims from memory instead of stopping to teach. It disclosed that these were unverified; that did not make the default choice acceptable.

## The fix

Added **If I don't understand** to [the start file](../Project%202/00-start-here.md), lines 31–35. It requires smaller steps with technical context, a hypothetical example, one question, then a stop. It bans opt-out route choices and confident claims when sources are missing.

## Same-input rerun

The rerun explained the route, check, and smallest-test concepts. It marked example checks unknown, labelled the invented effort estimate, and waited before selecting tools or writing code. Only the start file changed; the original Step 2 and saved Project 2 output stayed unchanged. [Verification](outputs/workflow-audit/verification.json)

## What I learned

The latest run had more guardrails and more emphasis on slowing down and thinking instead of rushing. A recommendation should not become a decision by default.

## Limits and earlier history

This is one text-response test. It does not prove a real phone deployment or later workflow steps work. The response is still too long. The earlier website/status audit is [preserved here](outputs/workflow-audit/previous-audit-note.md); it is separate from this workflow wording fix and rerun.
