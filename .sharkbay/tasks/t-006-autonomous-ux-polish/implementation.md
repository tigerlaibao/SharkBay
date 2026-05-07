# Implementation Notes

## Summary

Completed an autonomous UX polish pass focused on removing repeated and low-signal entities in the project workbench.

## Changes

| Path | Summary |
| --- | --- |
| `src/renderer/App.tsx` | Removed empty active-task wording from project rows, hid duplicate pass/pending gate pills, removed the disabled not-setup action, hid current task duplication from queue tabs, and simplified current task facts. |

## Decisions During Implementation

| Decision | Reason |
| --- | --- |
| Hide queue priority unless values differ. | Identical numeric ranks do not help the user decide. |
| Show project gate only when blocked in project rows. | `done/pass` and `coding/pending` repeated the same state. |
| Hide active queue item when it duplicates the current task card. | The right pane should not show the same task twice. |
| Remove static Branch/Repo facts from the current task card. | They are not current-work decision signals and remain available through project configuration/source data. |

## Known Risks

| Risk | Follow-up |
| --- | --- |
| Some hidden low-frequency details may need a future explicit "details" view. | Add only when the user asks to inspect those details. |
