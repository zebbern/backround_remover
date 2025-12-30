# Superpowers Usage Guide

How to get the most out of superpowers for your AI-assisted development workflow.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding the Workflow](#understanding-the-workflow)
3. [Best Practices](#best-practices)
4. [Example Scenarios](#example-scenarios)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
6. [Prompt Templates](#prompt-templates)

---

## Quick Start

### The Golden Rule

**Tell the AI WHAT you want, not HOW to do it.**

Superpowers handles the "how" through its skills. Your job is to clearly describe:
- What you want to build/fix
- Why you need it
- Any constraints or preferences

### Minimal Effective Prompts

| ❌ Without Superpowers | ✅ With Superpowers |
|------------------------|---------------------|
| "Add a button component with hover states, accessibility, TypeScript types, and tests" | "Add a reusable button component" |
| "Find the bug in useBackgroundRemoval.ts line 45, I think it's the async handling" | "Background removal sometimes fails silently" |
| "Create a plan with tasks for adding dark mode" | "Add dark mode support" |

The AI will automatically:
- Ask clarifying questions (brainstorming)
- Explore approaches with you
- Create a detailed plan
- Implement with TDD
- Review and verify

---

## Understanding the Workflow

### The Superpowers Flow

```
You: "I want [feature/fix]"
        ↓
   BRAINSTORMING
   - AI asks questions one at a time
   - You answer, refine the idea
   - AI proposes 2-3 approaches
   - You pick one
   - Design document created
        ↓
   WRITING PLANS
   - AI creates bite-sized tasks (2-5 min each)
   - Every task has exact files, code, tests
   - Plan saved to docs/plans/
        ↓
   EXECUTION (choose one)
   ┌─────────────────┬─────────────────┐
   │ Subagent-Driven │ Batch Execution │
   │ - Fast          │ - Checkpoints   │
   │ - Autonomous    │ - More control  │
   │ - Review each   │ - Review batches│
   └─────────────────┴─────────────────┘
        ↓
   FINISHING
   - Verify all tests pass
   - Merge, PR, or keep branch
   - Cleanup
```

### When Each Skill Activates

| You Say | AI Uses |
|---------|---------|
| "Add...", "Create...", "Build..." | `brainstorming` → `writing-plans` → execution |
| "Fix...", "Bug in...", "Not working..." | `systematic-debugging` → `test-driven-development` |
| "Refactor...", "Improve..." | `brainstorming` (to understand goals) → TDD |
| "Review this code" | `requesting-code-review` |
| "I got feedback on..." | `receiving-code-review` |
| "Ship it", "Merge", "Done" | `finishing-a-development-branch` |

---

## Best Practices

### 1. Let the AI Lead the Conversation

**Don't front-load requirements.** Let brainstorming extract them.

```
❌ BAD:
"Add a settings panel with toggles for: dark mode, notifications, 
auto-save, language selection. Use React, TypeScript, store in 
localStorage, add animations, make it accessible..."

✅ GOOD:
"Users need a way to configure the app"
```

The AI will ask:
- "What settings do users need to configure?"
- "Where should settings be stored - localStorage, database, or both?"
- "Should changes apply immediately or require a save button?"

This ensures nothing is missed and you consider alternatives.

### 2. Answer One Question at a Time

During brainstorming, the AI asks focused questions. Match that energy:

```
AI: "Should the settings persist across sessions?"

❌ BAD:
"Yes, use localStorage, and also we need to sync with the server 
for logged-in users, and export/import settings..."

✅ GOOD:
"Yes, they should persist"
```

Let the AI's next question guide the conversation.

### 3. Trust the Process, Even for "Simple" Things

```
You: "Just add a loading spinner"

AI: "Using brainstorming to refine the loading spinner design.
    
    First, let me understand the current state. I see you have 
    CanvasViewer.tsx with image processing. 
    
    Where should the spinner appear?
    1. Overlay on the canvas during processing
    2. Replace the canvas entirely
    3. Small indicator in the corner"
```

What seems simple often has hidden complexity. The brainstorming catches it.

### 4. Don't Skip to Implementation

```
❌ BAD:
"Skip the design phase, just implement this feature from my spec"

✅ GOOD:
"I have a rough spec. Help me refine it and plan implementation"
```

Even with existing specs, brainstorming validates assumptions.

### 5. Request Execution Style

After planning, you'll be asked:

```
AI: "Plan complete. Two execution options:
    1. Subagent-Driven (this session) - fast, autonomous
    2. Batch Execution - checkpoints for review
    
    Which approach?"
```

**Choose Subagent-Driven when:**
- You trust the plan
- Want speed
- Tasks are independent

**Choose Batch Execution when:**
- Plan is complex/uncertain
- Want to review every 3 tasks
- Learning the codebase

---

## Example Scenarios

### Scenario 1: Adding a New Feature

**Your prompt:**
```
"Add the ability to download the processed image"
```

**What happens:**

1. **Brainstorming kicks in:**
   ```
   AI: "Using brainstorming to design the download feature.
   
   I see you have a background removal app with CanvasViewer.
   
   What format should downloads be in?
   1. PNG (preserves transparency)
   2. JPEG (smaller size)
   3. Both options
   4. User's choice"
   ```

2. **You answer:** "User's choice"

3. **AI continues:**
   ```
   "Should the download happen:
   1. Immediately when clicking download
   2. Show a preview first with format/quality options
   3. Quick download with format selector dropdown"
   ```

4. **After 4-5 questions, AI presents design:**
   ```
   "Here's the design for the download feature:
   
   ## Component: DownloadButton
   
   A button below the canvas that opens a dropdown with:
   - PNG (original quality)
   - PNG (compressed)
   - JPEG (adjustable quality slider)
   
   Clicking an option triggers immediate download with
   filename: 'background-removed-[timestamp].png'
   
   Does this look right so far?"
   ```

5. **You approve, AI creates plan:**
   ```
   Plan saved to docs/plans/2025-12-30-download-feature.md
   
   Tasks:
   1. Create DownloadButton component (test first)
   2. Add canvas-to-blob utility (test first)
   3. Integrate with CanvasViewer
   4. Add format selection dropdown
   5. Implement quality slider for JPEG
   
   Subagent-Driven or Batch Execution?
   ```

6. **Execution proceeds with TDD, code review, verification**

---

### Scenario 2: Fixing a Bug

**Your prompt:**
```
"The background removal sometimes doesn't work on large images"
```

**What happens:**

1. **Systematic debugging activates:**
   ```
   AI: "Using systematic-debugging to investigate the large image issue.
   
   Phase 1: Root Cause Investigation
   
   First, I need to understand the failure:
   - What size images fail? (rough dimensions)
   - Does it fail silently or show an error?
   - Does the browser console show anything?"
   ```

2. **You provide info:** "Over 4000px width, no error, just hangs"

3. **AI investigates:**
   ```
   "Let me check the backgroundRemovalService.ts...
   
   I see the issue. The service processes the entire image 
   synchronously without chunking. For 4000px+ images, this 
   blocks the main thread and appears to hang.
   
   Hypothesis: Processing needs to be chunked or moved to 
   a Web Worker.
   
   Let me create a failing test to verify this..."
   ```

4. **TDD takes over:**
   ```
   "Using test-driven-development for the fix.
   
   Step 1: Write failing test
   
   test('handles images over 4000px width', async () => {
     const largeImage = createTestImage(5000, 3000);
     const result = await removeBackground(largeImage);
     expect(result).toBeDefined();
     expect(result.width).toBe(5000);
   });
   
   Running test to verify it fails..."
   ```

---

### Scenario 3: Refactoring

**Your prompt:**
```
"The state management is getting messy, help me clean it up"
```

**What happens:**

1. **Brainstorming to understand goals:**
   ```
   AI: "Using brainstorming to plan the state management refactor.
   
   Let me review the current state in useAppStore.ts...
   
   I see a Zustand store with image state, processing state, 
   and UI state mixed together.
   
   What's the main pain point?
   1. Hard to find where state is defined
   2. Components re-render too often
   3. State logic is duplicated
   4. Something else?"
   ```

2. **After understanding, proposes approaches:**
   ```
   "Three approaches for cleaner state:
   
   1. **Split by domain** (recommended)
      - imageStore (original, processed, history)
      - uiStore (modals, loading, errors)
      - settingsStore (user preferences)
      
   2. **Keep single store, add selectors**
      - Same structure, but memoized selectors
      - Less change, solves re-render issues
      
   3. **Move to React Query**
      - Better for async state
      - Bigger change
   
   I recommend #1 because... Which approach?"
   ```

---

### Scenario 4: Quick Tasks

Even small tasks benefit from the process:

**Your prompt:**
```
"Change the primary color from blue to purple"
```

**What happens:**

```
AI: "Using brainstorming to clarify the color change.

This seems straightforward, but let me verify:

Looking at tailwind.config.js, I see you're using Tailwind's 
default blue palette in multiple places.

Should purple replace blue:
1. Everywhere (global rebrand)
2. Just the primary buttons/accents
3. Something specific?"
```

Even "simple" changes get validated to prevent surprises.

---

### Scenario 5: Working with External Feedback

**Your prompt:**
```
"My teammate reviewed the PR and left these comments: [paste comments]"
```

**What happens:**

```
AI: "Using receiving-code-review to process this feedback.

Let me evaluate each item:

1. 'Use optional chaining here' 
   → Checking... valid suggestion, will implement.

2. 'This should be memoized'
   → Checking... actually this only renders once, 
     memoization would add overhead. I'll push back.

3. 'Add error boundary'
   → Valid for production robustness.

Items 1 and 3 are valid. For item 2, I recommend:
'This component only renders on mount, so memoization 
adds overhead without benefit. Want me to add a comment 
explaining this, or do you prefer I add memo anyway?'"
```

---

## Anti-Patterns to Avoid

### ❌ Dictating Implementation

```
WRONG: "Use useCallback on line 45 of ImageUploader.tsx"

RIGHT: "ImageUploader seems to re-render a lot"
```

Let the AI diagnose and fix properly.

### ❌ Skipping Verification

```
WRONG: "That looks good, ship it"

RIGHT: "Run the tests and verify it works"
```

The AI should always verify before claiming completion.

### ❌ Rushing Through Brainstorming

```
WRONG: "Yes yes yes, just build it already"

RIGHT: Take 2 minutes to answer thoughtfully
```

Those 2 minutes save hours of rework.

### ❌ Giving Too Much Context Upfront

```
WRONG: [3 paragraphs explaining everything you know about the feature]

RIGHT: "Add user authentication"
```

Let brainstorming extract what's relevant.

### ❌ Asking to Skip TDD

```
WRONG: "Don't worry about tests, just implement it"

RIGHT: Trust the TDD process
```

Tests ARE the implementation. They come first.

---

## Prompt Templates

### For New Features
```
"Add [feature name]"

or

"Users need a way to [user goal]"
```

### For Bugs
```
"[Thing] isn't working correctly - [symptom]"

or

"Bug: [describe what happens vs what should happen]"
```

### For Refactoring
```
"The [component/area] is getting hard to [maintain/understand/test]"

or

"Help me improve [area] - it feels [messy/slow/complex]"
```

### For Performance
```
"[Action] feels slow"

or

"The app lags when [doing something]"
```

### For Learning
```
"Explain how [part of codebase] works"

or

"Walk me through [file/component]"
```

### To Resume Work
```
"Continue with the plan in docs/plans/[filename].md"
```

### To Finish
```
"All tasks done, let's wrap up this branch"
```

---

## Tips for Maximum Effectiveness

1. **Start fresh conversations for new features** - avoids context pollution

2. **One feature per conversation** - keeps things focused

3. **Save and commit plans** - you can resume later or hand off to another session

4. **Let subagents handle implementation** - they follow TDD strictly

5. **Review at checkpoints** - don't rubber-stamp, actually read what was built

6. **Use worktrees for isolation** - keeps main branch clean

7. **Don't micro-manage** - trust the skills, intervene only when blocked

---

## Summary

| To Get Best Results | Do This |
|--------------------|---------|
| Start a feature | State the goal, not the solution |
| Answer questions | One thing at a time, don't front-load |
| During planning | Let AI break it down, verify the plan |
| During execution | Let it run, review at checkpoints |
| For bugs | Describe symptoms, let it investigate |
| To finish | Ask to wrap up the branch |

**The less you dictate HOW, the better the results.**

Superpowers exists to enforce disciplined development. Your role is to provide direction, constraints, and approval. Let the skills handle the rest.
