# Cut-It-Out Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `executing-plans` skill to implement this plan task-by-task.

**Goal:** Implement quick wins (file validation, error UI, progress callback, memory cleanup) and larger improvements (refactor CanvasViewer, optimize history, add tests).

**Architecture:** Fix immediate issues first, then refactor large component into smaller pieces with custom hooks, finally add comprehensive test coverage.

**Tech Stack:** React 19, TypeScript, Zustand, Vitest, @testing-library/react

---

## Phase 1: Quick Wins (30 minutes)

### Task 1: Add File Size Validation

**Files:**
- Modify: `src/components/ImageUploader.tsx`
- Modify: `src/store/useAppStore.ts`

**Step 1: Add error state to store**

In `src/store/useAppStore.ts`, add error handling:

```typescript
// Add to AppState interface
error: string | null;

// Add to actions
setError: (error: string | null) => void;
clearError: () => void;

// Add to store implementation
error: null,
setError: (error) => set({ error }),
clearError: () => set({ error: null }),
```

**Step 2: Add file validation in ImageUploader**

In `src/components/ImageUploader.tsx`:

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const onDrop = useCallback((acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  
  if (!file) return;
  
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    setError(`Invalid file type. Please use: ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}`);
    return;
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    setError(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    return;
  }
  
  clearError();
  // ... rest of processing
}, [setOriginalImage, setError, clearError]);
```

---

### Task 2: Show Error State UI

**Files:**
- Modify: `src/App.tsx`

**Step 1: Display error banner**

Add error display in `src/App.tsx`:

```typescript
const { error, clearError } = useAppStore();

// In JSX, after header:
{error && (
  <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 mx-4 mt-4 rounded-lg flex items-center justify-between">
    <span>{error}</span>
    <button 
      onClick={clearError}
      className="text-red-400 hover:text-red-300 ml-4"
    >
      ✕
    </button>
  </div>
)}
```

---

### Task 3: Wire Up Progress Callback

**Files:**
- Modify: `src/store/useAppStore.ts`
- Modify: `src/services/backgroundRemovalService.ts`
- Modify: `src/hooks/useBackgroundRemoval.ts`

**Step 1: Add progress state to store**

```typescript
// Add to AppState interface
processingProgress: number;

// Add to actions
setProcessingProgress: (progress: number) => void;

// Add to store
processingProgress: 0,
setProcessingProgress: (progress) => set({ processingProgress: progress }),
```

**Step 2: Update service to use progress callback**

In `src/services/backgroundRemovalService.ts`:

```typescript
export const removeBackground = async (
  imageSource: string,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  const blob = await imglyRemoveBackground(imageSource, {
    progress: (key, current, total) => {
      if (onProgress && total > 0) {
        onProgress(Math.round((current / total) * 100));
      }
    },
  });
  return blob;
};
```

**Step 3: Wire progress in hook**

In `src/hooks/useBackgroundRemoval.ts`:

```typescript
const { setProcessedImage, setIsProcessing, setProcessingProgress, setError } = useAppStore();

const result = await removeBackground(originalImage, (progress) => {
  setProcessingProgress(progress);
});
```

**Step 4: Show progress in UI**

In `src/App.tsx`:

```typescript
const { isProcessing, processingProgress } = useAppStore();

// Replace simple "Processing..." with:
{isProcessing && (
  <div className="text-center py-8">
    <div className="text-white mb-2">Processing... {processingProgress}%</div>
    <div className="w-64 mx-auto bg-gray-700 rounded-full h-2">
      <div 
        className="bg-blue-500 h-2 rounded-full transition-all"
        style={{ width: `${processingProgress}%` }}
      />
    </div>
  </div>
)}
```

---

### Task 4: Fix Memory Leaks (Revoke Blob URLs)

**Files:**
- Modify: `src/store/useAppStore.ts`
- Modify: `src/components/ImageUploader.tsx`

**Step 1: Add cleanup in store**

Update `setOriginalImage` and `setProcessedImage` to revoke old URLs:

```typescript
setOriginalImage: (image) => {
  const { originalImage } = get();
  if (originalImage?.startsWith('blob:')) {
    URL.revokeObjectURL(originalImage);
  }
  set({ originalImage: image, processedImage: null, history: [], historyIndex: -1 });
},

setProcessedImage: (image) => {
  const { processedImage } = get();
  if (processedImage?.startsWith('blob:')) {
    URL.revokeObjectURL(processedImage);
  }
  set({ processedImage: image });
},
```

**Step 2: Add reset cleanup**

Update `resetState` to revoke all URLs:

```typescript
resetState: () => {
  const { originalImage, processedImage, history } = get();
  
  // Cleanup blob URLs
  if (originalImage?.startsWith('blob:')) URL.revokeObjectURL(originalImage);
  if (processedImage?.startsWith('blob:')) URL.revokeObjectURL(processedImage);
  history.forEach(url => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  });
  
  set({
    originalImage: null,
    processedImage: null,
    // ... rest of reset
  });
},
```

---

## Phase 2: Refactor CanvasViewer (1-2 hours)

### Task 5: Extract Canvas Rendering Hook

**Files:**
- Create: `src/hooks/useCanvasRenderer.ts`
- Modify: `src/components/CanvasViewer.tsx`

**Step 1: Create useCanvasRenderer hook**

```typescript
// src/hooks/useCanvasRenderer.ts
import { useEffect, useRef } from 'react';

interface UseCanvasRendererProps {
  processedImage: string | null;
  maskData: ImageData | null;
  zoom: number;
  panOffset: { x: number; y: number };
}

export function useCanvasRenderer({
  processedImage,
  maskData,
  zoom,
  panOffset,
}: UseCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedImageRef = useRef<HTMLImageElement | null>(null);

  // ... extract rendering logic from CanvasViewer
  
  return {
    canvasRef,
    offscreenCanvasRef,
    processedImageRef,
    renderCanvas,
  };
}
```

---

### Task 6: Extract Brush Painting Hook

**Files:**
- Create: `src/hooks/useBrushPainting.ts`
- Modify: `src/components/CanvasViewer.tsx`

**Step 1: Create useBrushPainting hook**

```typescript
// src/hooks/useBrushPainting.ts
import { useCallback, useRef } from 'react';

interface UseBrushPaintingProps {
  brushMode: 'erase' | 'restore';
  brushSize: number;
  zoom: number;
  panOffset: { x: number; y: number };
  onMaskChange: (maskData: ImageData) => void;
}

export function useBrushPainting({
  brushMode,
  brushSize,
  zoom,
  panOffset,
  onMaskChange,
}: UseBrushPaintingProps) {
  const isPaintingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const startPainting = useCallback((e: React.MouseEvent) => {
    // ... extract from CanvasViewer
  }, []);

  const paint = useCallback((e: React.MouseEvent) => {
    // ... extract from CanvasViewer
  }, []);

  const stopPainting = useCallback(() => {
    // ... extract from CanvasViewer
  }, []);

  return { startPainting, paint, stopPainting };
}
```

---

### Task 7: Extract Smart Selection Hook

**Files:**
- Create: `src/hooks/useSmartSelection.ts`
- Modify: `src/components/CanvasViewer.tsx`

**Step 1: Create useSmartSelection hook**

```typescript
// src/hooks/useSmartSelection.ts
import { useCallback } from 'react';

interface UseSmartSelectionProps {
  tolerance: number;
  zoom: number;
  panOffset: { x: number; y: number };
  onMaskChange: (maskData: ImageData) => void;
}

export function useSmartSelection({
  tolerance,
  zoom,
  panOffset,
  onMaskChange,
}: UseSmartSelectionProps) {
  const performSmartSelect = useCallback((
    e: React.MouseEvent,
    canvas: HTMLCanvasElement,
    originalImageData: ImageData
  ) => {
    // ... extract flood fill algorithm from CanvasViewer
  }, [tolerance, zoom, panOffset, onMaskChange]);

  return { performSmartSelect };
}
```

---

### Task 8: Extract Toolbar Component

**Files:**
- Create: `src/components/CanvasToolbar.tsx`
- Modify: `src/components/CanvasViewer.tsx`

**Step 1: Create CanvasToolbar component**

```typescript
// src/components/CanvasToolbar.tsx
import React from 'react';

interface CanvasToolbarProps {
  brushMode: 'erase' | 'restore';
  brushSize: number;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onBrushModeChange: (mode: 'erase' | 'restore') => void;
  onBrushSizeChange: (size: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
}

export function CanvasToolbar({
  brushMode,
  brushSize,
  zoom,
  canUndo,
  canRedo,
  onBrushModeChange,
  onBrushSizeChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onUndo,
  onRedo,
  onDownload,
}: CanvasToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
      {/* ... extract toolbar JSX from CanvasViewer */}
    </div>
  );
}
```

---

## Phase 3: Optimize History Storage (30 minutes)

### Task 9: Convert History to Blob URLs

**Files:**
- Modify: `src/store/useAppStore.ts`

**Step 1: Use blob URLs instead of data URLs**

Update history to store blob URLs and revoke on removal:

```typescript
pushToHistory: (imageDataUrl) => {
  const { history, historyIndex } = get();
  
  // Revoke URLs that will be removed
  const removedHistory = history.slice(historyIndex + 1);
  removedHistory.forEach(url => {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  });
  
  // Convert data URL to blob URL for memory efficiency
  let newHistoryItem = imageDataUrl;
  if (imageDataUrl.startsWith('data:')) {
    fetch(imageDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        // Update in place
      });
  }
  
  const newHistory = [...history.slice(0, historyIndex + 1), imageDataUrl];
  // Limit history and cleanup old entries
  if (newHistory.length > 10) {
    const removed = newHistory.shift();
    if (removed?.startsWith('blob:')) URL.revokeObjectURL(removed);
  }
  
  set({ history: newHistory, historyIndex: newHistory.length - 1 });
},
```

---

## Phase 4: Add Test Suite (1-2 hours)

### Task 10: Set Up Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

**Step 2: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
```

**Step 3: Create test setup**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
```

---

### Task 11: Add Store Tests

**Files:**
- Create: `src/store/useAppStore.test.ts`

**Step 1: Write store tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.getState().resetState();
  });

  describe('image state', () => {
    it('sets original image', () => {
      useAppStore.getState().setOriginalImage('test-image.png');
      expect(useAppStore.getState().originalImage).toBe('test-image.png');
    });

    it('clears processed image when setting new original', () => {
      useAppStore.getState().setProcessedImage('processed.png');
      useAppStore.getState().setOriginalImage('new-original.png');
      expect(useAppStore.getState().processedImage).toBeNull();
    });
  });

  describe('brush controls', () => {
    it('updates brush size', () => {
      useAppStore.getState().setBrushSize(50);
      expect(useAppStore.getState().brushSize).toBe(50);
    });

    it('toggles brush mode', () => {
      useAppStore.getState().setBrushMode('restore');
      expect(useAppStore.getState().brushMode).toBe('restore');
    });
  });

  describe('history', () => {
    it('pushes to history', () => {
      useAppStore.getState().pushToHistory('state1');
      expect(useAppStore.getState().history).toHaveLength(1);
    });

    it('limits history to 10 items', () => {
      for (let i = 0; i < 15; i++) {
        useAppStore.getState().pushToHistory(`state${i}`);
      }
      expect(useAppStore.getState().history).toHaveLength(10);
    });

    it('supports undo', () => {
      useAppStore.getState().pushToHistory('state1');
      useAppStore.getState().pushToHistory('state2');
      useAppStore.getState().undo();
      expect(useAppStore.getState().historyIndex).toBe(0);
    });
  });
});
```

---

### Task 12: Add Component Tests

**Files:**
- Create: `src/components/ImageUploader.test.tsx`

**Step 1: Write uploader tests**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploader } from './ImageUploader';

// Mock the store
vi.mock('../store/useAppStore', () => ({
  useAppStore: vi.fn(() => ({
    setOriginalImage: vi.fn(),
    setError: vi.fn(),
    clearError: vi.fn(),
  })),
}));

describe('ImageUploader', () => {
  it('renders upload zone', () => {
    render(<ImageUploader />);
    expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
  });

  it('shows accepted file types', () => {
    render(<ImageUploader />);
    expect(screen.getByText(/png.*jpg/i)).toBeInTheDocument();
  });
});
```

---

## Commit Strategy

After each task:
```bash
git add -A
git commit -m "feat/fix: description"
```

Final merge:
```bash
git checkout main
git merge feature/improvements
```
