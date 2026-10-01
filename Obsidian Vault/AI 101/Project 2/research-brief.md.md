## Research question

How can LLMs help non-technical people build with code without misleading them about what is feasible or how to verify the result?

## Short answer

Code LLMs can lower the language barrier to programming, but they do not remove the need to understand and evaluate the code they produce. In a controlled study of 67 non-programmers, Feldman and Anderson identified barriers that included technical communication and difficulty understanding generated code and error messages. The checked evidence supports including code-reading, error interpretation, and clear intent-setting in a non-expert's toolkit; it does not establish that an LLM can reliably determine every project's feasibility. For my workflow, a feasibility check before prototyping is a reasonable design implication, but it remains a proposed safeguard—not a finding directly tested by this source.

## Claim 1: Code literacy supports useful iteration

### The claim I checked

Non-experts who cannot read code or understand error messages may have difficulty using those outputs to improve their Code LLM prompts.

### What the source says

Feldman and Anderson report a controlled study of 67 non-programmers and write: “Without being able to read code or understand error messages, non-programmers lacked useful feedback on how to improve their prompts.” I read this in the authors' version of *Non-Expert Programmers in the Generative AI Future*, in the results/conclusion discussion. [Paper (authors' version)](https://www.feldmanmolly.com/chiwork2024-author-version.pdf) · [DOI](https://doi.org/10.1145/3663384.3663393).

### The corrected claim

Code-reading and error-message comprehension can help non-experts use generated output to give more useful feedback during Code LLM interactions; this is not evidence that every non-expert must learn to program fluently.

### Why this matters for my workflow

If I cannot inspect or test generated code, I may mistake a plausible-looking prototype for a working one, fail to give the model useful correction, and spend time or tokens iterating in the wrong direction. This connection to my feasibility problem is a workflow inference from the study, not a tested result of the paper.

### The rule, input, or check this supports

In the planned `workflow-checklist.md`, add a review checkpoint before expanding a prototype: ask for a plain-language explanation of the changed code and its assumptions, run a small test, and surface errors or blockers before adding features. The explanation-and-test checkpoint is my proposed application of the finding.
