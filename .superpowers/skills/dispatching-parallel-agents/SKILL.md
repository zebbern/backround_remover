---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
---

# Dispatching Parallel Agents

## Overview

When you have multiple unrelated failures (different test files, different subsystems, different bugs), investigating them sequentially wastes time. Each investigation is independent and can happen in parallel.

**Core principle:** Dispatch one agent per independent problem domain. Let them work concurrently.

## When to Use

- Multiple failures? → Yes
- Are they independent? → Yes (not related)
- Can they work in parallel? → Yes (no shared state)
→ Use parallel dispatch

**Use when:**
- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem can be understood without context from others
- No shared state between investigations

**Don't use when:**
- Failures are related (fix one might fix others)
- Need to understand full system state
- Agents would interfere with each other

## The Pattern

### 1. Identify Independent Domains

Group failures by what's broken:
- File A tests: Component X logic
- File B tests: Component Y behavior
- File C tests: Component Z functionality

Each domain is independent - fixing X doesn't affect Z tests.

### 2. Create Focused Agent Tasks

Each agent gets:
- **Specific scope:** One test file or subsystem
- **Clear goal:** Make these tests pass
- **Constraints:** Don't change other code
- **Expected output:** Summary of what you found and fixed

### 3. Dispatch in Parallel

Using `runSubagent` tool:

```
runSubagent(
  prompt: "Fix the failing tests in src/components/ComponentA.test.ts...",
  description: "Fix ComponentA tests"
)

runSubagent(
  prompt: "Fix the failing tests in src/hooks/useHookB.test.ts...",
  description: "Fix useHookB tests"
)

runSubagent(
  prompt: "Fix the failing tests in src/services/ServiceC.test.ts...",
  description: "Fix ServiceC tests"
)
// All three run concurrently
```

### 4. Review and Integrate

When agents return:
- Read each summary
- Verify fixes don't conflict
- Run full test suite
- Integrate all changes

## Agent Prompt Structure

Good agent prompts are:
1. **Focused** - One clear problem domain
2. **Self-contained** - All context needed to understand the problem
3. **Specific about output** - What should the agent return?

```markdown
Fix the 3 failing tests in src/components/ImageUploader.test.tsx:

1. "should handle file upload correctly" - expects onUpload to be called
2. "should validate file type" - jpeg not accepted
3. "should show error for large files" - no error displayed

These are likely state management or event handling issues. Your task:

1. Read the test file and understand what each test verifies
2. Identify root cause - component bug or test setup issue?
3. Fix by:
   - Fixing component bugs if found
   - Adjusting test expectations if testing changed behavior
   - Use systematic-debugging skill

Do NOT just add timeouts - find the real issue.

Return: Summary of what you found and what you fixed.
```

## Common Mistakes

**❌ Too broad:** "Fix all the tests" - agent gets lost
**✅ Specific:** "Fix ImageUploader.test.tsx" - focused scope

**❌ No context:** "Fix the race condition" - agent doesn't know where
**✅ Context:** Paste the error messages and test names

**❌ No constraints:** Agent might refactor everything
**✅ Constraints:** "Do NOT change production code" or "Fix tests only"

**❌ Vague output:** "Fix it" - you don't know what changed
**✅ Specific:** "Return summary of root cause and changes"

## When NOT to Use

**Related failures:** Fixing one might fix others - investigate together first
**Need full context:** Understanding requires seeing entire system
**Exploratory debugging:** You don't know what's broken yet
**Shared state:** Agents would interfere (editing same files, using same resources)

## Key Benefits

1. **Parallelization** - Multiple investigations happen simultaneously
2. **Focus** - Each agent has narrow scope, less context to track
3. **Independence** - Agents don't interfere with each other
4. **Speed** - 3 problems solved in time of 1

## Verification

After agents return:
1. **Review each summary** - Understand what changed
2. **Check for conflicts** - Did agents edit same code?
3. **Run full suite** - Verify all fixes work together
4. **Spot check** - Agents can make systematic errors
