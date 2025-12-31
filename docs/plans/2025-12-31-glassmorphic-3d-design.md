# Glassmorphic 3D Design Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `executing-plans` skill to implement this plan task-by-task.

**Goal:** Transform the UI into a modern glassmorphic design with 3D elements, maintaining dark mode and existing color palette while adding professional polish and visual depth.

**Architecture:** Layer-based glassmorphic system with backdrop blur effects, 3D transforms with perspective for depth, and micro-interactions. Base layer remains zinc-950, with semi-transparent zinc-900 glass panels featuring backdrop blur. 3D transforms applied selectively to interactive elements with translateZ layering.

**Tech Stack:** Tailwind CSS (extended config), CSS custom properties, transform/perspective CSS, React hooks for interactive 3D effects

---

## Task 1: Foundation - Global Styles & CSS Variables

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

**Step 1: Extend Tailwind config with custom utilities**

Add to `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

**Step 2: Update global styles with 3D foundation**

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  background-color: #0f172a;
  /* Slate 900 */
  color: #f8fafc;
  /* Slate 50 */

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  /* 3D Perspective System */
  --perspective: 1200px;
  --perspective-origin: center center;
  
  /* Glass Effect Variables */
  --glass-bg: rgba(24, 24, 27, 0.4);
  --glass-border: rgba(63, 63, 70, 0.3);
  --glass-blur: 24px;
  
  /* Depth Layers */
  --z-base: 0px;
  --z-canvas: 20px;
  --z-controls: 40px;
  --z-modal: 60px;
  
  /* Shadow System */
  --shadow-glow: 0 0 20px rgba(132, 204, 22, 0.1);
  --shadow-depth: 0 8px 32px rgba(0, 0, 0, 0.4);
  --shadow-elevated: 0 20px 60px rgba(0, 0, 0, 0.6);
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  background-size: 200% 200%;
  animation: gradient 15s ease infinite;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Glass utility classes */
@layer utilities {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
  }
  
  .glass-strong {
    background: rgba(24, 24, 27, 0.6);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid rgba(63, 63, 70, 0.5);
  }
  
  .perspective-container {
    perspective: var(--perspective);
    perspective-origin: var(--perspective-origin);
  }
  
  .preserve-3d {
    transform-style: preserve-3d;
  }
  
  .shadow-glow {
    box-shadow: var(--shadow-glow), var(--shadow-depth);
  }
  
  .shadow-glow-strong {
    box-shadow: 0 0 30px rgba(132, 204, 22, 0.2), var(--shadow-elevated);
  }
}
```

**Step 3: Verify styles compile**

Run: `npm run dev`
Expected: Dev server starts without errors

**Step 4: Commit foundation**

```bash
git add src/index.css tailwind.config.js
git commit -m "feat: add glassmorphic 3D foundation with CSS variables and Tailwind extensions"
```

---

## Task 2: Main App Container with 3D Perspective

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`

**Step 1: Update App.css with 3D container styles**

Replace `src/App.css` content:
```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  perspective: 1200px;
  perspective-origin: center center;
}

.app-container {
  transform-style: preserve-3d;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter, transform;
  transition: filter 300ms, transform 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em rgba(132, 204, 22, 0.4));
  transform: translateZ(10px) scale(1.05);
}

.card {
  padding: 2em;
}

/* 3D Interactive base */
.interactive-3d {
  will-change: transform;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-3d:hover {
  transform: translateZ(8px) scale(1.02);
}

.interactive-3d:active {
  transform: translateZ(2px) scale(0.98);
}
```

**Step 2: Update App.tsx main container**

Find in `src/App.tsx`:
```tsx
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-lime-500/30">
```

Replace with:
```tsx
  return (
    <div className="min-h-screen text-zinc-100 selection:bg-lime-500/30 perspective-container">
      <div className="app-container preserve-3d">
```

**Step 3: Close the new wrapper div**

Find the closing `</div>` at end of return statement, add second closing div:
```tsx
      </div>
      <ToastContainer />
    </div>
  </div>
```

**Step 4: Test visual changes**

Run: `npm run dev`
Expected: Page loads with subtle 3D perspective

**Step 5: Commit**

```bash
git add src/App.tsx src/App.css
git commit -m "feat: add 3D perspective container to main app"
```

---

## Task 3: Glassmorphic Header with GitHub Button

**Files:**
- Modify: `src/App.tsx` (header section around line 100-120)

**Step 1: Update header section with glass styling**

Find in `src/App.tsx`:
```tsx
      {/* Header */}
      <header className="mb-12">
```

Replace entire header section up to `</header>` with:
```tsx
      {/* Header */}
      <header className="mb-12 relative">
        <div className="glass rounded-2xl p-6 shadow-glow interactive-3d" 
             style={{ transform: 'translateZ(var(--z-controls))' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 via-lime-100 to-zinc-100 bg-clip-text text-transparent">
                Cut It Out
              </h1>
              <p className="text-zinc-400 mt-2 font-light tracking-wide">
                AI-powered background removal
              </p>
            </div>
            <a
              href="https://github.com/suvink/cut-it-out"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-strong rounded-xl px-6 py-3 flex items-center gap-3 interactive-3d
                         hover:border-lime-500/50 hover:shadow-glow-strong transition-all duration-300
                         group"
            >
              <Github className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-medium">Star on GitHub</span>
            </a>
          </div>
        </div>
      </header>
```

**Step 2: Verify header renders**

Run: `npm run dev`
Expected: Header has glass effect with 3D hover

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: apply glassmorphic styling to header with 3D effects"
```

---

## Task 4: Enhanced Error Banner with Glass

**Files:**
- Modify: `src/App.tsx` (error banner section)

**Step 1: Update error banner styling**

Find in `src/App.tsx`:
```tsx
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/10 border border-red-500 text-red-400 px-6 py-3 rounded-lg flex items-center gap-4 shadow-lg backdrop-blur-sm">
```

Replace with:
```tsx
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
                        glass-strong border-red-500/50 text-red-400 px-6 py-3 rounded-xl 
                        flex items-center gap-4 shadow-glow-strong
                        animate-in slide-in-from-top duration-300"
             style={{ transform: 'translateX(-50%) translateZ(var(--z-modal))' }}>
```

**Step 2: Enhance close button**

Find the error close button:
```tsx
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
```

Replace with:
```tsx
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 transition-all duration-200
                       hover:scale-110 hover:rotate-90 interactive-3d"
          >
```

**Step 3: Test error display**

Run: `npm run dev`
Trigger an error to see the glass banner

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: enhance error banner with glass effect and 3D animations"
```

---

## Task 5: Glassmorphic Image Uploader with 3D Tilt

**Files:**
- Modify: `src/components/ImageUploader.tsx`

**Step 1: Add state for 3D tilt effect**

Add near the top of ImageUploader component after existing useState:
```tsx
    const [tiltStyle, setTiltStyle] = useState({});
```

**Step 2: Add mouse move handler for tilt**

Add before onDrop callback:
```tsx
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (isResizing) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        setTiltStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
        });
    }, [isResizing]);

    const handleMouseLeave = useCallback(() => {
        setTiltStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
        });
    }, []);
```

**Step 3: Update uploader container styling**

Find the return statement with getRootProps:
```tsx
    return (
        <div
            {...getRootProps()}
            className={clsx(
                "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ease-in-out",
```

Replace with:
```tsx
    return (
        <div
            {...getRootProps()}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
            className={clsx(
                "glass rounded-3xl p-12 text-center cursor-pointer preserve-3d",
                "border-2 border-dashed transition-all duration-300 ease-out",
```

**Step 4: Update state-based styling**

Find the isDragActive condition styles:
```tsx
                isResizing
                    ? "border-zinc-700 bg-zinc-900/50 cursor-wait"
                    : isDragActive
```

Replace with:
```tsx
                isResizing
                    ? "border-zinc-700/50 cursor-wait backdrop-blur-xl"
                    : isDragActive
                        ? "border-lime-500 bg-lime-500/5 shadow-glow-strong scale-105"
                        : "border-zinc-700/30 hover:border-lime-500/50 hover:bg-zinc-900/50 hover:shadow-glow"
```

**Step 5: Update Upload icon with 3D animation**

Find the Upload icon:
```tsx
            <Upload className="mx-auto h-16 w-16 text-zinc-400 mb-4" />
```

Replace with:
```tsx
            <Upload className={clsx(
                "mx-auto h-16 w-16 mb-4 transition-all duration-300",
                isDragActive 
                    ? "text-lime-400 scale-110 rotate-12" 
                    : "text-zinc-400 group-hover:text-lime-500"
            )} 
            style={{ transform: isDragActive ? 'translateZ(20px)' : 'translateZ(0)' }} />
```

**Step 6: Update text styling**

Find the upload text elements and enhance:
```tsx
            <p className="text-xl mb-2 text-zinc-200">
```

Replace with:
```tsx
            <p className="text-xl mb-2 text-zinc-200 font-medium tracking-wide">
```

And:
```tsx
            <p className="text-sm text-zinc-500">
```

Replace with:
```tsx
            <p className="text-sm text-zinc-500 font-light">
```

**Step 7: Test upload area interactions**

Run: `npm run dev`
Expected: Upload area tilts on mouse move, has glass effect

**Step 8: Commit**

```bash
git add src/components/ImageUploader.tsx
git commit -m "feat: add 3D tilt effect and glassmorphic styling to image uploader"
```

---

## Task 6: Canvas Viewer with Elevated Glass Effect

**Files:**
- Modify: `src/components/CanvasViewer.tsx`

**Step 1: Read current CanvasViewer to understand structure**

Read: `src/components/CanvasViewer.tsx` (lines 1-100 and remaining)

**Step 2: Update container with glass and 3D**

Find the main container div (around the canvas element):
```tsx
        <div className="relative inline-block">
```

Replace with:
```tsx
        <div className="relative inline-block glass-strong rounded-2xl p-4 shadow-glow-strong preserve-3d"
             style={{ transform: 'translateZ(var(--z-canvas))' }}>
```

**Step 3: Update canvas wrapper**

Find the canvas wrapper:
```tsx
          <div className="relative">
```

Replace with:
```tsx
          <div className="relative rounded-xl overflow-hidden border border-zinc-700/30">
```

**Step 4: Test canvas appearance**

Run: `npm run dev`
Upload an image to see glass canvas container

**Step 5: Commit**

```bash
git add src/components/CanvasViewer.tsx
git commit -m "feat: add glassmorphic elevated container to canvas viewer"
```

---

## Task 7: Canvas Toolbar with Glass Buttons

**Files:**
- Modify: `src/components/CanvasToolbar.tsx`

**Step 1: Read CanvasToolbar structure**

Read: `src/components/CanvasToolbar.tsx` (full file)

**Step 2: Update toolbar container**

Find toolbar container className:
```tsx
  return (
    <div className="flex gap-2 items-center justify-center flex-wrap">
```

Replace with:
```tsx
  return (
    <div className="glass rounded-2xl p-3 inline-flex gap-2 items-center justify-center flex-wrap shadow-glow preserve-3d"
         style={{ transform: 'translateZ(var(--z-controls))' }}>
```

**Step 3: Create glass button component styles**

Find button className patterns and update to:
```tsx
        className={clsx(
          "glass-strong px-4 py-2.5 rounded-xl font-medium interactive-3d",
          "transition-all duration-200 flex items-center gap-2",
          "hover:border-lime-500/50 hover:shadow-glow",
          tool === 'brush' && "border-lime-500 bg-lime-500/10 text-lime-400",
          tool !== 'brush' && "text-zinc-300 hover:text-lime-400"
        )}
```

**Step 4: Update all toolbar buttons with consistent glass styling**

Apply similar glass styling pattern to all toolbar buttons (export, download, etc.)

**Step 5: Test toolbar interactions**

Run: `npm run dev`
Expected: Toolbar has glass effect with 3D button hovers

**Step 6: Commit**

```bash
git add src/components/CanvasToolbar.tsx
git commit -m "feat: apply glassmorphic styling to canvas toolbar buttons"
```

---

## Task 8: Background Picker with Glass Panels

**Files:**
- Modify: `src/components/BackgroundPicker.tsx`

**Step 1: Read BackgroundPicker**

Read: `src/components/BackgroundPicker.tsx`

**Step 2: Update main container**

Find container and apply glass:
```tsx
  return (
    <div className="glass rounded-2xl p-4 shadow-glow">
```

**Step 3: Update color/pattern swatches with 3D effect**

Find swatch button elements and add:
```tsx
className="interactive-3d hover:scale-110 transition-all duration-200"
```

**Step 4: Test background picker**

Run: `npm run dev`
Expected: Background options in glass container with 3D hover

**Step 5: Commit**

```bash
git add src/components/BackgroundPicker.tsx
git commit -m "feat: add glassmorphic styling to background picker"
```

---

## Task 9: Shadow & Edge Refinement Pickers with Glass

**Files:**
- Modify: `src/components/ShadowPicker.tsx`
- Modify: `src/components/EdgeRefinementPicker.tsx`

**Step 1: Update ShadowPicker container**

Find container in ShadowPicker and apply:
```tsx
<div className="glass rounded-2xl p-4 shadow-glow">
```

**Step 2: Update EdgeRefinementPicker container**

Same glass treatment:
```tsx
<div className="glass rounded-2xl p-4 shadow-glow">
```

**Step 3: Add interactive 3D to slider controls**

Find slider/input elements and add:
```tsx
className="... interactive-3d"
```

**Step 4: Test pickers**

Run: `npm run dev`
Expected: All pickers have consistent glass styling

**Step 5: Commit**

```bash
git add src/components/ShadowPicker.tsx src/components/EdgeRefinementPicker.tsx
git commit -m "feat: apply glassmorphic styling to shadow and edge refinement pickers"
```

---

## Task 10: Toast Container with 3D Slide Animations

**Files:**
- Modify: `src/components/ToastContainer.tsx`

**Step 1: Read ToastContainer**

Read: `src/components/ToastContainer.tsx`

**Step 2: Update toast item styling**

Find individual toast styling and enhance:
```tsx
className="glass-strong rounded-xl px-4 py-3 shadow-glow-strong
           animate-in slide-in-from-right duration-300 preserve-3d"
style={{ transform: 'translateZ(var(--z-modal))' }}
```

**Step 3: Add 3D rotation to toast entrance**

Add entrance animation in CSS or inline style:
```tsx
style={{ 
  transform: 'translateZ(var(--z-modal))',
  animation: 'slideInToast 0.3s ease-out'
}}
```

**Step 4: Update toast close button with 3D**

Find close button:
```tsx
className="interactive-3d hover:rotate-90 transition-all duration-200"
```

**Step 5: Test toast notifications**

Run: `npm run dev`
Trigger toasts to see 3D animations

**Step 6: Commit**

```bash
git add src/components/ToastContainer.tsx
git commit -m "feat: add 3D animations and glass effects to toast notifications"
```

---

## Task 11: Keyboard Shortcuts Help Modal

**Files:**
- Modify: `src/components/KeyboardShortcutsHelp.tsx`

**Step 1: Read KeyboardShortcutsHelp**

Read: `src/components/KeyboardShortcutsHelp.tsx`

**Step 2: Update modal backdrop**

Find backdrop/overlay:
```tsx
className="fixed inset-0 backdrop-blur-xl bg-zinc-950/80 z-50"
```

**Step 3: Update modal content container**

Find modal content:
```tsx
className="glass-strong rounded-3xl p-8 max-w-2xl mx-auto shadow-glow-strong
           preserve-3d animate-in zoom-in-95 duration-300"
style={{ transform: 'translateZ(var(--z-modal))' }}
```

**Step 4: Add 3D entrance animation**

Modal should slide in with rotation:
```tsx
@keyframes modalEnter {
  from {
    transform: translateZ(0) rotateX(-15deg);
    opacity: 0;
  }
  to {
    transform: translateZ(var(--z-modal)) rotateX(0);
    opacity: 1;
  }
}
```

**Step 5: Test modal open/close**

Run: `npm run dev`
Press ? to open shortcuts help

**Step 6: Commit**

```bash
git add src/components/KeyboardShortcutsHelp.tsx
git commit -m "feat: add glassmorphic styling and 3D animations to keyboard shortcuts modal"
```

---

## Task 12: GitHub Star Toast with Glass

**Files:**
- Modify: `src/components/GitHubStarToast.tsx`

**Step 1: Read GitHubStarToast**

Read: `src/components/GitHubStarToast.tsx`

**Step 2: Update toast styling**

Find toast container:
```tsx
className="glass-strong rounded-2xl p-4 shadow-glow-strong preserve-3d
           animate-in slide-in-from-bottom duration-500"
style={{ transform: 'translateZ(var(--z-modal))' }}
```

**Step 3: Add 3D hover to star button**

Find star button:
```tsx
className="interactive-3d hover:scale-105 glass rounded-xl px-6 py-3
           hover:border-lime-500/50 hover:shadow-glow transition-all duration-300"
```

**Step 4: Test GitHub star toast**

Run: `npm run dev`
Expected: Toast appears with glass and 3D

**Step 5: Commit**

```bash
git add src/components/GitHubStarToast.tsx
git commit -m "feat: apply glassmorphic styling to GitHub star toast"
```

---

## Task 13: Processing Progress Indicator

**Files:**
- Modify: `src/App.tsx` (progress display section)

**Step 1: Find processing progress display**

Locate progress indicator in App.tsx

**Step 2: Add glass overlay with blur**

Enhance progress display:
```tsx
{isProcessing && (
  <div className="fixed inset-0 backdrop-blur-md bg-zinc-950/50 z-40 
                  flex items-center justify-center">
    <div className="glass-strong rounded-3xl p-8 shadow-glow-strong preserve-3d"
         style={{ transform: 'translateZ(var(--z-modal))' }}>
      <div className="text-center">
        <div className="animate-glow-pulse text-lime-400 text-lg font-medium mb-4">
          Processing...
        </div>
        <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-lime-500 to-lime-400 transition-all duration-300"
            style={{ width: `${processingProgress}%` }}
          />
        </div>
        <div className="text-zinc-400 text-sm mt-2">
          {processingProgress}%
        </div>
      </div>
    </div>
  </div>
)}
```

**Step 3: Test processing state**

Run: `npm run dev`
Upload image to see progress overlay

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: enhance processing indicator with glassmorphic overlay"
```

---

## Task 14: Preload Progress Indicator

**Files:**
- Modify: `src/App.tsx` (preload section)

**Step 1: Find preload indicator**

Locate where preload progress is displayed

**Step 2: Add glass styling to preload banner**

If preload indicator exists, enhance:
```tsx
{isPreloading && (
  <div className="glass rounded-xl px-4 py-2 text-sm text-zinc-400 shadow-glow mb-4">
    Loading AI model... {Math.round(preloadProgress)}%
  </div>
)}
```

**Step 3: Test preload display**

Run: `npm run dev` (fresh page load)
Expected: Glass preload indicator

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add glass styling to model preload indicator"
```

---

## Task 15: Final Polish - Transitions and Performance

**Files:**
- Modify: `src/index.css`

**Step 1: Add smooth page load animation**

Add to `src/index.css`:
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes slideInToast {
  from {
    transform: translateX(100%) translateZ(var(--z-modal)) rotateY(15deg);
    opacity: 0;
  }
  to {
    transform: translateX(0) translateZ(var(--z-modal)) rotateY(0);
    opacity: 1;
  }
}

/* Performance optimizations */
.interactive-3d,
.glass,
.glass-strong {
  will-change: transform;
}

/* Ripple effect for clicks */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(132, 204, 22, 0.3);
  width: 20px;
  height: 20px;
  animation: ripple 0.6s ease-out;
  pointer-events: none;
}
```

**Step 2: Add staggered fade-in to main sections**

In App.tsx, add animation delays to major sections:
```tsx
<header className="mb-12 relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
<div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
```

**Step 3: Test performance**

Run: `npm run dev`
Check Chrome DevTools Performance tab
Expected: 60fps on interactions

**Step 4: Commit**

```bash
git add src/index.css src/App.tsx
git commit -m "feat: add page load animations and performance optimizations"
```

---

## Task 16: Build and Verify

**Step 1: Run production build**

```bash
npm run build
```

Expected: Build succeeds without warnings

**Step 2: Preview production build**

```bash
npm run preview
```

Expected: All glass effects and 3D animations work

**Step 3: Run tests**

```bash
npm test
```

Expected: All existing tests pass

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify glassmorphic 3D design implementation complete"
```

---

## Testing Checklist

- [ ] Glass effects render on all major components
- [ ] 3D hover effects work on interactive elements
- [ ] Backdrop blur performs well (check Safari)
- [ ] Animations respect prefers-reduced-motion
- [ ] Upload area tilt follows mouse correctly
- [ ] Toasts slide in with 3D rotation
- [ ] Modal appears with glass backdrop
- [ ] Processing indicator has glass overlay
- [ ] All colors maintain contrast for accessibility
- [ ] Performance: 60fps during interactions
- [ ] Mobile: Touch interactions feel responsive
- [ ] Build size: Check bundle didn't increase significantly

---

## Notes

- All existing functionality preserved
- No new color additions (only opacity/blur variations)
- Dark mode maintained throughout
- 3D effects are subtle but noticeable
- Performance optimized with will-change and GPU acceleration
- Accessibility: reduced motion support included
- Glass effects may have slight performance impact on older devices - test thoroughly
