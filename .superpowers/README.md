# Superpowers for VS Code / GitHub Copilot

A complete software development workflow for AI coding agents, adapted from [obra/superpowers](https://github.com/obra/superpowers) for VS Code and GitHub Copilot.

## How It Works

Superpowers provides a structured set of "skills" that guide AI agents through disciplined software development workflows. When you start working on a task, the AI doesn't just jump into writing code. Instead, it:

1. **Brainstorms** - Refines ideas through questions, explores alternatives, validates design
2. **Plans** - Creates detailed, bite-sized implementation tasks with TDD
3. **Executes** - Follows the plan exactly, with verification at each step
4. **Reviews** - Two-stage code review (spec compliance + quality)
5. **Finishes** - Proper branch management and integration

## Available Skills

| Skill | Purpose |
|-------|---------|
| `using-superpowers` | Introduction to the skills system |
| `brainstorming` | Interactive design refinement before coding |
| `writing-plans` | Create detailed implementation plans |
| `executing-plans` | Execute plans in batches with checkpoints |
| `test-driven-development` | RED-GREEN-REFACTOR cycle |
| `systematic-debugging` | 4-phase root cause investigation |
| `verification-before-completion` | Evidence before claims |
| `subagent-driven-development` | Dispatch subagents per task |
| `dispatching-parallel-agents` | Parallel investigation of independent issues |
| `requesting-code-review` | Pre-review checklist |
| `receiving-code-review` | Responding to feedback properly |
| `using-git-worktrees` | Isolated development branches |
| `finishing-a-development-branch` | Merge/PR decision workflow |

## Core Principles

1. **Test-Driven Development** - Write tests first, always
2. **Systematic over ad-hoc** - Process over guessing
3. **Complexity reduction** - Simplicity as primary goal
4. **Evidence over claims** - Verify before declaring success
5. **YAGNI** - You Aren't Gonna Need It
6. **DRY** - Don't Repeat Yourself

## Tool Mappings

When skills reference Claude Code tools, use these VS Code/Copilot equivalents:

| Skill Reference | VS Code/Copilot Tool |
|-----------------|---------------------|
| `TodoWrite` | `manage_todo_list` |
| `Task` with subagents | `runSubagent` tool |
| `Skill` tool | Read skill file from `skills/[name]/SKILL.md` |
| File operations | Standard file read/edit tools |

## How Skills Are Invoked

Skills are automatically invoked when the AI detects a relevant situation:

- **Starting any creative work?** → `brainstorming` skill
- **Have requirements for multi-step work?** → `writing-plans` skill
- **Have a plan to execute?** → `executing-plans` skill
- **About to write implementation code?** → `test-driven-development` skill
- **Encountering bugs or test failures?** → `systematic-debugging` skill
- **About to claim work is done?** → `verification-before-completion` skill

## License

Based on [obra/superpowers](https://github.com/obra/superpowers), MIT License.
