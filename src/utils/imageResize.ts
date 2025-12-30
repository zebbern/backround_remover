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

/**
 * Maximum dimension (width or height) for processed images.
 * Images larger than this will be scaled down to prevent performance issues.
 */
export const MAX_IMAGE_DIMENSION = 4096;

/**
 * Maximum dimension for mobile devices to prevent out-of-memory crashes.
 * Mobile devices have significantly less memory available for processing.
 */
export const MAX_IMAGE_DIMENSION_MOBILE = 2048;

/**
 * Threshold for showing a warning about large images.
 */
export const LARGE_IMAGE_THRESHOLD = 2048;

/**
 * Detect if the current device is a mobile device.
 * Uses multiple signals for reliable detection.
 */
export function isMobileDevice(): boolean {
    // Check for touch capability + small screen (most reliable for actual mobile)
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    // Also check user agent for mobile keywords
    const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return (hasTouchScreen && isSmallScreen) || mobileUserAgent;
}

/**
 * Get the appropriate max dimension based on device type.
 */
export function getMaxDimension(): number {
    return isMobileDevice() ? MAX_IMAGE_DIMENSION_MOBILE : MAX_IMAGE_DIMENSION;
}

export interface ImageDimensions {
    width: number;
    height: number;
}

export interface ResizeResult {
    dataUrl: string;
    originalDimensions: ImageDimensions;
    newDimensions: ImageDimensions;
    wasResized: boolean;
}

/**
 * Load an image from a data URL and return its dimensions.
 */
export function getImageDimensions(dataUrl: string): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
        img.src = dataUrl;
    });
}

/**
 * Check if an image needs to be resized based on its dimensions.
 */
export function needsResize(dimensions: ImageDimensions, maxDimension: number = MAX_IMAGE_DIMENSION): boolean {
    return dimensions.width > maxDimension || dimensions.height > maxDimension;
}

/**
 * Calculate new dimensions while maintaining aspect ratio.
 */
export function calculateResizedDimensions(
    original: ImageDimensions,
    maxDimension: number = MAX_IMAGE_DIMENSION
): ImageDimensions {
    const { width, height } = original;
    
    if (width <= maxDimension && height <= maxDimension) {
        return { width, height };
    }

    const aspectRatio = width / height;
    
    if (width > height) {
        return {
            width: maxDimension,
            height: Math.round(maxDimension / aspectRatio),
        };
    } else {
        return {
            width: Math.round(maxDimension * aspectRatio),
            height: maxDimension,
        };
    }
}

/**
 * Resize an image if it exceeds the maximum dimension.
 * Uses high-quality image smoothing for better results.
 */
export function resizeImageIfNeeded(
    dataUrl: string,
    maxDimension: number = MAX_IMAGE_DIMENSION
): Promise<ResizeResult> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const originalDimensions = { width: img.width, height: img.height };
            
            // Check if resize is needed
            if (!needsResize(originalDimensions, maxDimension)) {
                resolve({
                    dataUrl,
                    originalDimensions,
                    newDimensions: originalDimensions,
                    wasResized: false,
                });
                return;
            }

            // Calculate new dimensions
            const newDimensions = calculateResizedDimensions(originalDimensions, maxDimension);

            // Create canvas and resize
            const canvas = document.createElement('canvas');
            canvas.width = newDimensions.width;
            canvas.height = newDimensions.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Use high-quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw resized image
            ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height);

            // Convert to data URL (use PNG for lossless output)
            const resizedDataUrl = canvas.toDataURL('image/png');

            resolve({
                dataUrl: resizedDataUrl,
                originalDimensions,
                newDimensions,
                wasResized: true,
            });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image for resizing'));
        };

        img.src = dataUrl;
    });
}

/**
 * Check if image is considered "large" (may cause slower processing).
 */
export function isLargeImage(dimensions: ImageDimensions, threshold: number = LARGE_IMAGE_THRESHOLD): boolean {
    return dimensions.width > threshold || dimensions.height > threshold;
}

/**
 * Format image dimensions for display.
 */
export function formatDimensions(dimensions: ImageDimensions): string {
    return `${dimensions.width} × ${dimensions.height}`;
}
