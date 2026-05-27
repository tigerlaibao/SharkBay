---
kind: sharkbay_task
taskId: P7N4Q2-u17682804-m00cfd9
taskTag: P7N4Q2
mode: quick
title: Add macOS release script
status: completed
actor: tigerlaibao
githubUserId: 17682804
machine: 00cfd9
agent: Codex GPT-5
sessionId: 019e6795-5fd0-7d83-9656-b6e3276d9859
branch: main
createdAt: 2026-05-27T04:09:52Z
updatedAt: 2026-05-27T04:11:35Z
completedAt: 2026-05-27T04:11:35Z
---

## Summary
Added a repeatable local macOS release workflow for signed and notarized builds. The script now stops early with actionable messages when Developer ID or notarization prerequisites are missing.

## Files
- package.json
- scripts/release-mac.sh
- .sharkbay/tasks/P7N4Q2-u17682804-m00cfd9-add-macos-release-script.md

## Work
- Created a SharkBay task record before project changes.
- Added a local macOS release script that checks signing and notarization prerequisites, builds a macOS release, and verifies app/DMG notarization.
- Added an npm release command and enabled electron-builder notarization for macOS builds.

## Verification
- `bash -n scripts/release-mac.sh` passed.
- `npm test -- build-config` passed.
- `npm run release:mac` stopped before build with the expected prerequisite failure: missing Developer ID Application signing identity in Keychain.

## Notes
- Team context search found no prior related release/signing task.
- No commit was produced.
- `package-lock.json` was already modified before this task and was left untouched.
