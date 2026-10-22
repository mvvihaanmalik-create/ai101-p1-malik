# Connection fix and rerun

October 22, 2026. These are setup errors, not weak research answers.

1. [Attempt 1](attempt-1/run-manifest.json): both turns failed because the installed Codex client rejected `readOnly.access`. Neither reached research.
2. [Attempt 2](attempt-2/run-manifest.json): the restricted permission profile was accepted, but the configured `gpt-6-luna` model was unavailable for this account. Neither reached research.
3. [Successful pair](run-manifest.json): used a named restricted profile and `gpt-6-astra`, returned as the available catalog default. Both turns completed in fresh conversations with the same input hash.

A sandbox-only setup retry exited before a research turn. Its error is preserved in `setup-retry/`; the successful pair used the approved network-enabled execution path.

The profile denies general filesystem access and permits the isolated workspace plus platform basics. Shell, local execution, apps, plugins, and multi-agent tools were disabled. Public web search remained available. No credentials were included in the input or output files.

The same compatibility changes are saved in `design-shelf/scripts/agent-bridge.mjs`. Its syntax check passed. The existing popup worker was not restarted; this is not evidence of a complete hosted popup or library-write test.

Implementation references: [OpenAI App Server documentation](https://learn.chatgpt.com/docs/app-server), [Codex permissions](https://learn.chatgpt.com/docs/permissions), and the installed 0.154.0 protocol schema. The installed version rejected the older field, so the working named-profile form was used. Global Codex settings were left alone.
