# Verification

## Commands

- `npm run typecheck`
  - Exit code: 0
- `npm test -- tests/renderer-workflow.test.ts tests/harness-reader.test.ts tests/self-host-workflow.test.ts tests/harness-template-sync.test.ts tests/template-installer.test.ts`
  - Exit code: 0
  - Result: 5 files passed, 37 tests passed.
- `npm test`
  - Exit code: 0
  - Result: 16 files passed, 88 tests passed.
- `rg -n "generateNextActionPrompt|NextActionPrompt|prompts:nextAction|PromptPanel|prompt-panel|prompt-box|projectNeedsUserAction|userActionReason|agentHandoffReason|displayGateStatus|gateStatus|requiresUserAction|userActionRequired|approvalReason|taskRegistration|RunnerSummary|validateRunnerJson|normalizeRunnerMetadata|emptyRunnerSummary|waiting_for_human|Needs action|Needs Action|Agent Handoff" src electron tests templates .sharkbay/protocol.md .sharkbay/docs/product.md .sharkbay/docs/architecture.md docs/agents.md docs/roadmap.md`
  - Exit code: 1
  - Result: no matches.
- `git diff --check`
  - Exit code: 0
- `npm run build`
  - Exit code: 0
  - Result: Vite production build completed. Existing chunk-size warning remains.

## Done Criteria

- UI no longer shows Needs action or Agent Handoff/prompt controls.
- Prompt-generation API/types/tests are removed.
- Gate/user-action fields are no longer exposed in app project/task contracts.
- Task phases still render in queue/detail UI.
