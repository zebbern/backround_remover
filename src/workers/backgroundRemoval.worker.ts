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

import { removeBackground, preload, type Config } from '@imgly/background-removal';

export interface WorkerMessage {
    type: 'process' | 'preload';
    imageData?: ArrayBuffer;
    mimeType?: string;
}

export interface WorkerResponse {
    type: 'progress' | 'complete' | 'error' | 'preload-complete';
    progress?: number;
    result?: ArrayBuffer;
    error?: string;
}

// Track if model is already loaded to avoid re-downloading
let isModelLoaded = false;

// Shared config for consistent behavior - model stays cached after first load
const getConfig = (onProgress?: (key: string, current: number, total: number) => void): Config => ({
    progress: onProgress,
    debug: false,
    device: 'gpu', // Use WebGPU if available, falls back to CPU automatically
});

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const { type, imageData, mimeType } = event.data;

    if (type === 'preload') {
        // Skip if already loaded
        if (isModelLoaded) {
            const response: WorkerResponse = { type: 'preload-complete' };
            self.postMessage(response);
            return;
        }
        
        // Preload WASM and ONNX model files
        try {
            const config = getConfig((_key, current, total) => {
                if (total > 0) {
                    const percentage = Math.round((current / total) * 100);
                    const response: WorkerResponse = { type: 'progress', progress: percentage };
                    self.postMessage(response);
                }
            });

            await preload(config);
            isModelLoaded = true;
            
            const response: WorkerResponse = { type: 'preload-complete' };
            self.postMessage(response);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Preload failed';
            const response: WorkerResponse = { type: 'error', error: errorMessage };
            self.postMessage(response);
        }
        return;
    }

    if (type === 'process' && imageData && mimeType) {
        try {
            // Convert ArrayBuffer back to Blob
            const blob = new Blob([imageData], { type: mimeType });

            const config = getConfig((_key, current, total) => {
                if (total > 0) {
                    const percentage = Math.round((current / total) * 100);
                    const response: WorkerResponse = { type: 'progress', progress: percentage };
                    self.postMessage(response);
                }
            });

            // Process the image - model will be cached from preload or loaded on first use
            const resultBlob = await removeBackground(blob, config);
            isModelLoaded = true; // Model is definitely loaded after processing
            
            // Convert Blob to ArrayBuffer for transfer
            const resultBuffer = await resultBlob.arrayBuffer();
            
            const response: WorkerResponse = { type: 'complete', result: resultBuffer };
            self.postMessage(response, { transfer: [resultBuffer] }); // Transfer ownership for performance
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const response: WorkerResponse = { type: 'error', error: errorMessage };
            self.postMessage(response);
        }
    }
};
