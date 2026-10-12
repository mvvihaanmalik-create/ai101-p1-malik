# Workflow diagram

The whole workflow on one page. The model reads `00-start-here.md` first, then works through the five step files in order. Every arrow waits for my approval. Step 4 is my own review of the evidence, so it is shown in red.

```mermaid
flowchart LR
    S["00 Start here<br/>the model reads this first"] --> G1["01 Define the goal"]
    G1 -->|I approve| G2["02 Check feasibility<br/>routes, OS limits,<br/>smallest test"]
    G2 -->|I approve| G3["03 Build a small prototype"]
    G3 -->|I approve| G4["04 Human check<br/>I review the evidence"]
    G4 -->|I approve| G5["05 Iterate or stop"]
    G5 -->|iterate| G3
    G5 -->|stop| Z(["Stop and record<br/>what is still unknown"])
    G2 -.->|check fails or was not run| W(["Report it and wait<br/>for my decision"])
    G3 -.->|check fails or was not run| W

    style G4 fill:#fde2e2,stroke:#c0392b,color:#000
    style W fill:#fff3cd,stroke:#b8860b,color:#000
```

## How to read it

- Solid arrows are the normal path. Each one needs my approval before the next step starts.
- Dotted arrows are the rule from the start guide: if a check fails or has not been run, the model reports that and waits for me instead of moving on.
- Step 5 either loops back to a small build and review, or stops and writes down what remains untested.
- The same sequence is in `process-map.canvas`, which is the Obsidian version of this picture.
