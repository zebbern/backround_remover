/*
 * Copyright 2025 Suvink
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useEffect, useRef } from 'react';
import type { CanvasRefs } from './useCanvasRenderer';

interface UseCursorRendererProps {
    refs: CanvasRefs;
    cursorPos: { x: number; y: number } | null;
    brushSize: number;
    brushMode: 'erase' | 'restore';
    zoom: number;
}

export function useCursorRenderer({
    refs,
    cursorPos,
    brushSize,
    brushMode,
    zoom,
}: UseCursorRendererProps) {
    const { cursorCanvasRef } = refs;
    const rafIdRef = useRef<number>(0);

    useEffect(() => {
        // Cancel any pending animation frame
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
        }

        rafIdRef.current = requestAnimationFrame(() => {
            const cursorCanvas = cursorCanvasRef.current;
            if (!cursorCanvas || !cursorPos) return;

            const ctx = cursorCanvas.getContext('2d');
            if (!ctx) return;

            // Get the container rect (parent of cursor canvas)
            const rect = cursorCanvas.getBoundingClientRect();
            
            // Set cursor canvas dimensions to match container (only if changed)
            if (cursorCanvas.width !== rect.width || cursorCanvas.height !== rect.height) {
                cursorCanvas.width = rect.width;
                cursorCanvas.height = rect.height;
            }
            
            ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

            // Calculate cursor position relative to the container
            const x = cursorPos.x - rect.left;
            const y = cursorPos.y - rect.top;

            // Only draw if cursor is within bounds
            if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

            // Draw Brush Cursor (scaled by zoom for visual consistency)
            const scaledBrushSize = (brushSize * zoom) / 2;
            
            ctx.beginPath();
            ctx.arc(x, y, scaledBrushSize, 0, Math.PI * 2);
            ctx.strokeStyle = brushMode === 'erase' ? '#ef4444' : '#22c55e';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Crosshair center
            ctx.beginPath();
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 5, y);
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x, y + 5);
            ctx.stroke();
        });

        return () => {
            if (rafIdRef.current) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [cursorCanvasRef, cursorPos, brushSize, brushMode, zoom]);
}
