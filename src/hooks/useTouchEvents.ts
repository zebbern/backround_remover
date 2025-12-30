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

import { useCallback, useRef, useState } from 'react';

interface TouchState {
    isPainting: boolean;
    isPanning: boolean;
    isPinching: boolean;
    lastTouchPos: { x: number; y: number };
    lastPinchDistance: number;
}

interface UseTouchEventsProps {
    zoom: number;
    pan: { x: number; y: number };
    setZoom: (zoom: number) => void;
    setPan: (pan: { x: number; y: number }) => void;
    onPaintStart: (x: number, y: number) => void;
    onPaintMove: (x: number, y: number) => void;
    onPaintEnd: () => void;
}

// Calculate distance between two touch points
function getTouchDistance(touch1: React.Touch, touch2: React.Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// Get center point between two touches
function getTouchCenter(touch1: React.Touch, touch2: React.Touch): { x: number; y: number } {
    return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
    };
}

export function useTouchEvents({
    zoom,
    pan,
    setZoom,
    setPan,
    onPaintStart,
    onPaintMove,
    onPaintEnd,
}: UseTouchEventsProps) {
    const touchStateRef = useRef<TouchState>({
        isPainting: false,
        isPanning: false,
        isPinching: false,
        lastTouchPos: { x: 0, y: 0 },
        lastPinchDistance: 0,
    });

    const [isTouching, setIsTouching] = useState(false);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        const touches = e.touches;

        if (touches.length === 1) {
            // Single finger = paint
            const touch = touches[0];
            touchStateRef.current = {
                ...touchStateRef.current,
                isPainting: true,
                isPanning: false,
                isPinching: false,
                lastTouchPos: { x: touch.clientX, y: touch.clientY },
            };
            setIsTouching(true);
            onPaintStart(touch.clientX, touch.clientY);
        } else if (touches.length === 2) {
            // Two fingers = pinch zoom or pan
            const touch1 = touches[0];
            const touch2 = touches[1];
            const distance = getTouchDistance(touch1, touch2);
            const center = getTouchCenter(touch1, touch2);

            touchStateRef.current = {
                ...touchStateRef.current,
                isPainting: false,
                isPanning: true,
                isPinching: true,
                lastTouchPos: center,
                lastPinchDistance: distance,
            };
            setIsTouching(true);
        }
    }, [onPaintStart]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        const touches = e.touches;
        const state = touchStateRef.current;

        if (touches.length === 1 && state.isPainting) {
            // Single finger painting
            const touch = touches[0];
            onPaintMove(touch.clientX, touch.clientY);
            touchStateRef.current.lastTouchPos = { x: touch.clientX, y: touch.clientY };
        } else if (touches.length === 2 && (state.isPanning || state.isPinching)) {
            // Two finger pinch/pan
            const touch1 = touches[0];
            const touch2 = touches[1];
            const newDistance = getTouchDistance(touch1, touch2);
            const newCenter = getTouchCenter(touch1, touch2);

            // Pinch zoom
            if (state.lastPinchDistance > 0) {
                const scale = newDistance / state.lastPinchDistance;
                const newZoom = Math.min(Math.max(zoom * scale, 0.1), 5);
                setZoom(newZoom);
            }

            // Pan
            const dx = newCenter.x - state.lastTouchPos.x;
            const dy = newCenter.y - state.lastTouchPos.y;
            setPan({ x: pan.x + dx, y: pan.y + dy });

            touchStateRef.current.lastTouchPos = newCenter;
            touchStateRef.current.lastPinchDistance = newDistance;
        }
    }, [zoom, pan, setZoom, setPan, onPaintMove]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        const state = touchStateRef.current;

        if (state.isPainting) {
            onPaintEnd();
        }

        // Reset if no more touches
        if (e.touches.length === 0) {
            touchStateRef.current = {
                isPainting: false,
                isPanning: false,
                isPinching: false,
                lastTouchPos: { x: 0, y: 0 },
                lastPinchDistance: 0,
            };
            setIsTouching(false);
        } else if (e.touches.length === 1) {
            // Switched from two fingers to one - start painting
            const touch = e.touches[0];
            touchStateRef.current = {
                isPainting: true,
                isPanning: false,
                isPinching: false,
                lastTouchPos: { x: touch.clientX, y: touch.clientY },
                lastPinchDistance: 0,
            };
            onPaintStart(touch.clientX, touch.clientY);
        }
    }, [onPaintStart, onPaintEnd]);

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        isTouching,
    };
}
