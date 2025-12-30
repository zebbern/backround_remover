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

import BackgroundRemovalWorker from '../workers/backgroundRemoval.worker?worker';
import type { WorkerMessage, WorkerResponse } from '../workers/backgroundRemoval.worker';

export type ProgressCallback = (progress: number) => void;

/**
 * Detect if we should use CPU processing (more stable on mobile).
 */
function shouldUseCpu(): boolean {
    // Check for mobile device indicators
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasLowMemory = 'deviceMemory' in navigator && (navigator as { deviceMemory?: number }).deviceMemory !== undefined && (navigator as { deviceMemory?: number }).deviceMemory! < 4;
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768;
    
    return mobileUserAgent || hasLowMemory || isSmallScreen;
}

class BackgroundRemovalService {
    private worker: Worker | null = null;
    private isPreloaded = false;
    private preloadPromise: Promise<void> | null = null;

    private getWorker(): Worker {
        if (!this.worker) {
            this.worker = new BackgroundRemovalWorker();
        }
        return this.worker;
    }

    /**
     * Preload WASM and ONNX model files in the background.
     * Call this early (e.g., on app mount) to speed up first image processing.
     */
    async preload(onProgress?: ProgressCallback): Promise<void> {
        // Return existing promise if already preloading
        if (this.preloadPromise) {
            return this.preloadPromise;
        }

        // Skip if already preloaded
        if (this.isPreloaded) {
            return Promise.resolve();
        }

        this.preloadPromise = new Promise((resolve, reject) => {
            const worker = this.getWorker();

            const handleMessage = (event: MessageEvent<WorkerResponse>) => {
                const { type, progress, error } = event.data;

                if (type === 'progress' && onProgress && progress !== undefined) {
                    onProgress(progress);
                } else if (type === 'preload-complete') {
                    worker.removeEventListener('message', handleMessage);
                    worker.removeEventListener('error', handleError);
                    this.isPreloaded = true;
                    this.preloadPromise = null;
                    resolve();
                } else if (type === 'error') {
                    worker.removeEventListener('message', handleMessage);
                    worker.removeEventListener('error', handleError);
                    this.preloadPromise = null;
                    reject(new Error(error || 'Preload failed'));
                }
            };

            const handleError = (event: ErrorEvent) => {
                worker.removeEventListener('message', handleMessage);
                worker.removeEventListener('error', handleError);
                this.preloadPromise = null;
                reject(new Error(event.message || 'Worker error'));
            };

            worker.addEventListener('message', handleMessage);
            worker.addEventListener('error', handleError);

            const message: WorkerMessage = { type: 'preload', useCpu: shouldUseCpu() };
            worker.postMessage(message);
        });

        return this.preloadPromise;
    }

    /**
     * Check if assets are preloaded
     */
    get preloaded(): boolean {
        return this.isPreloaded;
    }

    async removeBackground(
        imageSource: string | HTMLImageElement | Blob,
        onProgress?: ProgressCallback
    ): Promise<Blob> {
        // Convert image source to Blob if needed
        let blob: Blob;
        
        if (imageSource instanceof Blob) {
            blob = imageSource;
        } else if (typeof imageSource === 'string') {
            // Fetch the image and convert to blob
            const response = await fetch(imageSource);
            blob = await response.blob();
        } else if (imageSource instanceof HTMLImageElement) {
            // Convert HTMLImageElement to blob via canvas
            const canvas = document.createElement('canvas');
            canvas.width = imageSource.naturalWidth;
            canvas.height = imageSource.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            ctx.drawImage(imageSource, 0, 0);
            blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed to convert image')), 'image/png');
            });
        } else {
            throw new Error('Invalid image source type');
        }

        // Convert Blob to ArrayBuffer for worker transfer
        const arrayBuffer = await blob.arrayBuffer();
        const mimeType = blob.type || 'image/png';

        return new Promise((resolve, reject) => {
            const worker = this.getWorker();

            const handleMessage = (event: MessageEvent<WorkerResponse>) => {
                const { type, progress, result, error } = event.data;

                if (type === 'progress' && onProgress && progress !== undefined) {
                    onProgress(progress);
                } else if (type === 'complete' && result) {
                    worker.removeEventListener('message', handleMessage);
                    worker.removeEventListener('error', handleError);
                    // Convert ArrayBuffer back to Blob
                    const resultBlob = new Blob([result], { type: 'image/png' });
                    resolve(resultBlob);
                } else if (type === 'error') {
                    worker.removeEventListener('message', handleMessage);
                    worker.removeEventListener('error', handleError);
                    reject(new Error(error || 'Worker error'));
                }
            };

            const handleError = (event: ErrorEvent) => {
                worker.removeEventListener('message', handleMessage);
                worker.removeEventListener('error', handleError);
                reject(new Error(event.message || 'Worker error'));
            };

            worker.addEventListener('message', handleMessage);
            worker.addEventListener('error', handleError);

            // Send message to worker with transferable ArrayBuffer
            const message: WorkerMessage = {
                type: 'process',
                imageData: arrayBuffer,
                mimeType,
                useCpu: shouldUseCpu(),
            };
            worker.postMessage(message, [arrayBuffer]);
        });
    }

    terminate(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

export const backgroundRemovalService = new BackgroundRemovalService();
