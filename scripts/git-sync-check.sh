#!/usr/bin/env bash
# git-sync-check.sh
#
# Reports whether the local branch is in sync with its remote tracking branch.
# Used by a Claude Code SessionStart hook so a stale local clone surfaces
# automatically at the start of a session (see DESIGN_PLAN.md / the stale-clone
# incident where local main was 77 commits behind origin/main).
#
# Outputs a single JSON object on stdout that the hook understands:
#   - systemMessage:  shown to the user in the UI
#   - additionalContext: injected into Claude's context
#
# Network calls are non-interactive and time-boxed so they can never hang a session.

export GIT_TERMINAL_PROMPT=0
export GIT_SSH_COMMAND="ssh -o BatchMode=yes -o ConnectTimeout=8"

emit() {
  # $1 = message string -> emit as JSON (jq handles all escaping)
  printf '%s' "$1" | jq -R -s \
    '{systemMessage: ., hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: .}}'
}

# Not a git repo? Say nothing useful, exit cleanly.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  exit 0
fi

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"

# Best-effort fetch; ignore failures (offline, no creds, etc.)
git fetch --quiet 2>/dev/null || true

upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"

if [ -z "$upstream" ]; then
  emit "git: branch '${branch}' has no upstream tracking branch — can't check sync. Set one with: git branch --set-upstream-to=origin/${branch}"
  exit 0
fi

behind="$(git rev-list --count "HEAD..${upstream}" 2>/dev/null || echo 0)"
ahead="$(git rev-list --count "${upstream}..HEAD" 2>/dev/null || echo 0)"

if [ "${behind:-0}" -gt 0 ] && [ "${ahead:-0}" -gt 0 ]; then
  emit "⚠️ GIT SYNC: local '${branch}' has DIVERGED from '${upstream}' (${behind} behind, ${ahead} ahead). Reconcile before any code work — review/rebase so you're not building on stale code."
elif [ "${behind:-0}" -gt 0 ]; then
  emit "⚠️ GIT SYNC: local '${branch}' is ${behind} commit(s) BEHIND '${upstream}'. Pull/review before any code work so you're on current code."
elif [ "${ahead:-0}" -gt 0 ]; then
  emit "GIT SYNC: local '${branch}' is ${ahead} commit(s) ahead of '${upstream}' (unpushed work). In sync otherwise."
else
  emit "✓ GIT SYNC: '${branch}' is up to date with '${upstream}'."
fi
