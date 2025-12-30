---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

## When to Use

- Have implementation plan? → Yes
- Tasks mostly independent? → Yes
- Stay in this session? → Yes → Use this skill

**vs. Executing Plans:**
- Same session (no context switch)
- Fresh subagent per task (no context pollution)
- Two-stage review after each task: spec compliance first, then code quality
- Faster iteration (no human-in-loop between tasks)

## The Process

1. **Read plan, extract all tasks with full text, note context, create todo list**

2. **For each task:**
   - Dispatch implementer subagent with full task text + context
   - If subagent asks questions → answer, provide context, re-dispatch
   - Implementer implements, tests, commits, self-reviews
   
3. **Dispatch spec reviewer subagent**
   - Confirms code matches spec
   - If issues → implementer fixes → re-review
   
4. **Dispatch code quality reviewer subagent**  
   - Reviews code quality
   - If issues → implementer fixes → re-review
   
5. **Mark task complete**

6. **Repeat for remaining tasks**

7. **After all tasks: Use `finishing-a-development-branch` skill**

## Using runSubagent Tool

When dispatching subagents, use the `runSubagent` tool:

```
runSubagent(
  prompt: "Detailed task description with full context",
  description: "Brief 3-5 word summary"
)
```

**For implementer:**
```
runSubagent(
  prompt: "Implement Task 1: [full task text from plan]
  
  Context: [relevant project context]
  
  Requirements:
  - Follow TDD
  - Commit when done
  - Self-review before finishing
  
  Return: Summary of implementation and any issues found",
  description: "Implement [component name]"
)
```

**For spec reviewer:**
```
runSubagent(
  prompt: "Review implementation against spec.
  
  Task spec: [task requirements]
  
  Check:
  - All requirements met
  - Nothing extra added
  - Tests cover requirements
  
  Return: ✅ Spec compliant OR ❌ Issues: [list]",
  description: "Spec review task N"
)
```

**For code quality reviewer:**
```
runSubagent(
  prompt: "Review code quality of recent changes.
  
  Review for:
  - Clean code principles
  - Proper error handling
  - Test coverage
  - No obvious bugs
  
  Return: Strengths, Issues (by severity), Assessment",
  description: "Code review task N"  
)
```

## Red Flags

**Never:**
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context
- Ignore subagent questions
- Accept "close enough" on spec compliance
- Skip review loops
- **Start code quality review before spec compliance is ✅**
- Move to next task while either review has open issues

**If subagent asks questions:**
- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

**If reviewer finds issues:**
- Implementer (same subagent) fixes them
- Reviewer reviews again
- Repeat until approved
- Don't skip the re-review

## Integration

**Required workflow skills:**
- **writing-plans** - Creates the plan this skill executes
- **requesting-code-review** - Code review template for reviewer subagents
- **finishing-a-development-branch** - Complete development after all tasks

**Subagents should use:**
- **test-driven-development** - Subagents follow TDD for each task
