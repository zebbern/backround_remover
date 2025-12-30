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

import { useEffect, useState, useCallback, useRef } from 'react';
import { backgroundRemovalService } from '../services/backgroundRemovalService';

export interface PreloadState {
    isPreloading: boolean;
    isPreloaded: boolean;
    progress: number;
    error: string | null;
}

/**
 * Hook to preload the background removal model and WASM files.
 * This significantly speeds up the first image processing by downloading
 * assets in the background while the user is on the upload page.
 */
export function useModelPreload(): PreloadState {
    const [state, setState] = useState<PreloadState>({
        isPreloading: false,
        isPreloaded: backgroundRemovalService.preloaded,
        progress: 0,
        error: null,
    });
    
    // Use ref to avoid stale closure issues
    const isPreloadingRef = useRef(false);

    const startPreload = useCallback(async () => {
        // Skip if already preloaded or currently preloading
        if (backgroundRemovalService.preloaded || isPreloadingRef.current) {
            return;
        }
        
        isPreloadingRef.current = true;
        setState(prev => ({ ...prev, isPreloading: true, error: null }));

        try {
            await backgroundRemovalService.preload((progress) => {
                setState(prev => ({ ...prev, progress }));
            });

            setState(prev => ({
                ...prev,
                isPreloading: false,
                isPreloaded: true,
                progress: 100,
            }));
            isPreloadingRef.current = false;

            console.log('[ModelPreload] Assets preloaded successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Preload failed';
            console.warn('[ModelPreload] Preload failed:', errorMessage);
            
            // Don't show error to user - preload failure is not critical
            // Assets will be loaded on first use instead
            setState(prev => ({
                ...prev,
                isPreloading: false,
                error: errorMessage,
            }));
            isPreloadingRef.current = false;
        }
    }, []); // No dependencies - uses refs to avoid stale closures

    useEffect(() => {
        // Start preloading after a short delay to not block initial render
        const timer = setTimeout(() => {
            startPreload();
        }, 100);

        return () => clearTimeout(timer);
    }, [startPreload]);

    return state;
}
