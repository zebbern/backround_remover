# GitHub Copilot Instructions - Superpowers Integration

<EXTREMELY-IMPORTANT>
You have superpowers. This file teaches you how to use them.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill by reading its contents from the `.superpowers/skills/` directory.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## How to Access Skills

Skills are located in `.superpowers/skills/` directory. When a skill applies:
1. Read the skill's `SKILL.md` file
2. Announce: "Using [skill-name] to [purpose]"
3. Follow the skill exactly

## Available Skills

| Skill | Trigger Condition |
|-------|------------------|
| `using-superpowers` | Start of any conversation - establishes skill usage |
| `brainstorming` | Before any creative work, feature creation, or design |
| `writing-plans` | When you have requirements for multi-step implementation |
| `executing-plans` | When you have a written plan to execute |
| `test-driven-development` | Before writing ANY implementation code |
| `systematic-debugging` | When encountering bugs, test failures, or unexpected behavior |
| `verification-before-completion` | Before claiming work is complete or fixed |
| `subagent-driven-development` | When executing plans with independent tasks (uses runSubagent) |
| `dispatching-parallel-agents` | When facing 2+ independent tasks (uses runSubagent) |
| `requesting-code-review` | After completing tasks or before merging |
| `receiving-code-review` | When receiving feedback |
| `finishing-a-development-branch` | When implementation complete, need to integrate |
| `using-git-worktrees` | When starting feature work needing isolation |

## The Rule

**Invoke relevant skills BEFORE any response or action.** Even a 1% chance a skill might apply means you should read the skill to check.

## Skill Priority

When multiple skills could apply:
1. **Process skills first** (brainstorming, debugging) - determine HOW to approach
2. **Implementation skills second** (TDD, patterns) - guide execution

"Build feature X" → brainstorming first, then TDD
"Fix this bug" → systematic-debugging first, then TDD for the fix

## Red Flags - Stop and Check Skills

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |

## Project-Specific Context

This is a **background remover web application** built with:
- React + TypeScript
- Vite build system
- Tailwind CSS
- Zustand for state management

Key directories:
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/services/` - Business logic services
- `src/store/` - Zustand store

## Tool Mappings for VS Code / GitHub Copilot

When skills reference Claude Code tools, use these mappings:

| Skill Reference | VS Code/Copilot Tool |
|-----------------|---------------------|
| `TodoWrite` | `manage_todo_list` |
| `Task` with subagents | `runSubagent` tool |
| `Skill` tool invocation | Read skill file from `.superpowers/skills/` |
| File operations | Standard file read/edit tools |

## Core Principles

1. **Test-Driven Development** - Write tests first, always
2. **Systematic over ad-hoc** - Process over guessing
3. **Complexity reduction** - Simplicity as primary goal
4. **Evidence over claims** - Verify before declaring success
5. **YAGNI** - You Aren't Gonna Need It
6. **DRY** - Don't Repeat Yourself

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.
