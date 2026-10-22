# Outputs

## Technologist

- [Original Project 2 output](p2-run.md).
- [Independent Technologist rerun](agent-run-claudian.md), used in the [comparison](../run-comparison.md).
- [Earlier agent output](agent-run.md), kept as supporting history.

The original output still matches the Project 2 file. The Technologist role still matches its copy in `Project 2/agents/Technologist.md`.

## Pip

- [Shared request](pip/request.md) and [frozen input](pip/input.json).
- [New baseline](pip/baseline-run.md) and [Pip run](pip/agent-run.md).
- [Comparison and limits](pip/run-comparison.md).
- `pip/*-raw.json` contains exact structured answers and public-search events. `pip/attempt-1/` and `pip/attempt-2/` keep the failed setup attempts.

Both successful Pip comparison runs used the same input bytes and model in fresh conversations. The baseline is a new, bounded run of Step 2's source-check instruction, not an original Project 2 output. Neither run wrote to the shelf or changed a workflow gate.
