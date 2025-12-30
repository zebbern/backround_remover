---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch code reviewer subagent to catch issues before they cascade.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
git rev-parse HEAD~1  # BASE_SHA
git rev-parse HEAD    # HEAD_SHA
```

**2. Dispatch code-reviewer subagent:**

Using `runSubagent` tool:

```
runSubagent(
  prompt: "Review the code changes between commits.

  **What was implemented:** [description]
  **Requirements/Plan:** [link or summary]
  **Base SHA:** [base]
  **Head SHA:** [head]
  
  Review for:
  - Does implementation match requirements?
  - Any bugs or issues?
  - Code quality concerns?
  - Test coverage adequate?
  
  Return:
  - Strengths: What's done well
  - Issues: Categorized by severity (Critical/Important/Minor)
  - Assessment: Ready to proceed or needs fixes",
  description: "Code review [feature]"
)
```

**3. Act on feedback:**
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with reasoning)

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

git rev-parse HEAD~1  # a7981ec
git rev-parse HEAD    # 3df7661

runSubagent(
  prompt: "Review code changes.
  
  What was implemented: Verification and repair functions for conversation index
  Requirements: Task 2 from docs/plans/deployment-plan.md
  Base SHA: a7981ec
  Head SHA: 3df7661
  
  Review for requirements match, bugs, quality, tests.",
  description: "Code review Task 2"
)

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed after fixing Important issues

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each batch (3 tasks)
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification
