# Connected workflow

Updated October 27. [Open Workshop](https://ideaquest-workshop.vercel.app/) · [[process-map.canvas|Canvas]] · [[../Project-03/agent-status|Agent status and evidence]]

idea.quest stores project records and progress. Six agents share the selected project, voice, rules and IdeaQuest skill. Switching views never approves a gate.

```mermaid
flowchart TD
    PROJECT["Selected project + request"] --> CHIEF["Chief of Staff: coordinate"]
    STORE[("idea.quest: notes, progress, decisions")] -. approved context .-> CHIEF
    CHIEF --> G1{"1. Approve goal"}
    G1 --> PIP["Pip (Design Shelf): find licensed assets"]
    CLOUD["Sunday cloud collection: 10 picks per category, replace up to 5"] -. public assets only .-> PIP
    PIP --> BOARD["Save and shortlist assets"]
    BOARD --> REF{"Approve references and hand off"}
    REF --> CREATIVE["Creative Partner: propose directions"]
    G1 -. no assets needed .-> CREATIVE
    G1 --> TECH["Technologist: evidence, routes, small test"]
    CREATIVE --> G2{"2. Approve direction, route and test"}
    TECH --> G2
    G2 --> BUILD["Programmer: stage small prototype"]
    BUILD --> APPLY{"Review files and Apply"}
    APPLY --> TRY["Try separate browser prototype"]
    TRY --> G3{"3. Accept prototype for review"}
    G3 --> AUDIT["Auditor: source review and supplied checks"]
    AUDIT --> FAILED{"Required check failed?"}
    FAILED -->|Yes| STOP["Stop and show failure"]
    STOP --> FIX{"Request a fix"}
    FIX --> BUILD
    STOP -->|Revisit plan, new cycle| CHIEF
    STOP -->|Pause| WAIT["Save and wait"]
    FAILED -->|No| G4{"4. Human check: try unknown checks and record evidence"}
    G4 --> G5{"5. Continue or stop"}
    G5 -->|Continue in new cycle| CHIEF
    G5 -->|Stop| DONE["Save outcome and remaining limits"]
    DONE -. records .-> STORE
    classDef decision fill:#fff0cd,stroke:#ae761e,color:#30220b;
    classDef agent fill:#e1efe8,stroke:#46755f,color:#173c2c;
    classDef pause fill:#fbe0df,stroke:#b74a43,color:#3d1715;
    class G1,REF,G2,APPLY,G3,G4,G5,FIX decision;
    class CHIEF,PIP,CREATIVE,TECH,BUILD,AUDIT agent;
    class STOP,WAIT pause;
```

## Approval and data rules

- Minor work can continue inside an approved step. Major choices need a concrete review point.
- Saving a card is not approving it. Creative Partner receives only the approved snapshot. A changed shortlist clears that approval.
- Reference approval and Apply are extra review actions within the five-step cycle, not extra progress points.
- Auditor supports technical review. The human-check step stays human. Unknown checks are never counted as passed.
- Failed checks pause progress until a requested fix or a reopened plan. Earlier results stay recorded.
- A changed project note needs a new review. Each project keeps its own cycle, drafts and conversations.
- Agents and project data use the PC. Sunday asset collection uses the cloud. Raw notes and passwords do not enter the cloud catalog.
- Original class gates do not approve a new Workshop cycle. Live progress comes from the selected cycle, not a number hardcoded in this diagram.

## Coursework progress

Part A's historical comparison is the Technologist run. Pip has its earlier controlled pair. Current comparisons for the other roles are new evidence, labelled with their limits in [[../Project-03/agent-status|agent-status]]. Part B is shared identity, voice, rules and skill across all six roles. Native Claudian observation, personal defense and submission remain separate from automated checks.
