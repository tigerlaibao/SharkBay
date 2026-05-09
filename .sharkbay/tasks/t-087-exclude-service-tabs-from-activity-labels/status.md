# Task Status

- Task ID: `t-087-exclude-service-tabs-from-activity-labels`
- Title: Exclude service tabs from terminal activity labels
- Phase: done
- Status: done
- Priority: 1
- Depends on: none
- Started: 2026-05-09T17:06:21+08:00

## Request

Tabs opened through service start/stop buttons should not participate in `working` / `idle` state calculation.

## Progress

- Registered active follow-up task.
- Moving directly to a narrow coding phase because the behavior is a small terminal activity aggregation correction.
- Extracted project terminal activity aggregation into a renderer workflow helper.
- Filtered service-started terminal tabs out of left-row activity label aggregation.
- Added focused service-tab exclusion coverage.
- Verification passed.

## Verification Plan

- Add focused renderer workflow coverage for service-tab exclusion.
- `npm run typecheck`
- `npm run build`
- `npm test`
- `git diff --check`

## Completed

2026-05-09T17:07:29+08:00
