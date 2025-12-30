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

import type { EdgeRefinementSettings } from '../store/useAppStore';

/**
 * Apply edge refinement to an image using canvas operations.
 * This processes the alpha channel to improve edge quality.
 */
export function applyEdgeRefinement(
    _ctx: CanvasRenderingContext2D,
    imageData: ImageData,
    settings: EdgeRefinementSettings,
    originalImageData?: ImageData
): ImageData {
    if (settings.mode === 'off') {
        return imageData;
    }

    const { width, height } = imageData;
    const data = new Uint8ClampedArray(imageData.data);

    // Apply edge contrast (sharpen alpha edges)
    if (settings.edgeContrast > 0) {
        applyAlphaContrast(data, width, height, settings.edgeContrast / 100, settings.mode === 'hair');
    }

    // Apply edge softness (controlled blur on edges only)
    if (settings.edgeSoftness > 0) {
        applyEdgeSoftness(data, width, height, settings.edgeSoftness / 100);
    }

    // Apply color decontamination (remove background color spill)
    if (settings.colorDecontamination > 0 && originalImageData) {
        applyColorDecontamination(data, originalImageData.data, width, height, settings.colorDecontamination / 100);
    }

    return new ImageData(data, width, height);
}

/**
 * Apply contrast to alpha channel to sharpen edges.
 * For hair mode, uses a more aggressive edge detection.
 */
function applyAlphaContrast(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    strength: number,
    isHairMode: boolean
): void {
    // Create a copy of alpha values
    const alphaValues = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        alphaValues[i] = data[i * 4 + 3] / 255;
    }

    // Calculate edge strength for each pixel
    const edgeStrength = new Float32Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            
            // Sobel-like edge detection on alpha
            const left = alphaValues[idx - 1];
            const right = alphaValues[idx + 1];
            const up = alphaValues[idx - width];
            const down = alphaValues[idx + width];
            
            const gx = right - left;
            const gy = down - up;
            edgeStrength[idx] = Math.sqrt(gx * gx + gy * gy);
        }
    }

    // Apply contrast based on edge strength
    // Use stronger multipliers for more visible effect
    const contrastMultiplier = isHairMode ? 4.0 : 2.5;
    const threshold = isHairMode ? 0.3 : 0.5;
    
    for (let i = 0; i < width * height; i++) {
        const alpha = alphaValues[i];
        const edge = edgeStrength[i];
        
        // Lower edge detection threshold for more pixels to be affected
        if (edge > 0.005) {
            // Apply S-curve contrast to edge pixels
            let adjusted = alpha;
            
            // Sigmoid contrast with stronger effect
            const factor = strength * contrastMultiplier;
            if (alpha < threshold) {
                // Push low alpha values lower (toward transparent)
                adjusted = alpha * Math.pow(alpha / threshold, factor);
            } else {
                // Push high alpha values higher (toward opaque)
                adjusted = 1 - (1 - alpha) * Math.pow((1 - alpha) / (1 - threshold), factor);
            }
            
            // Blend based on edge strength - stronger blending for visibility
            const blendFactor = Math.min(edge * 5, 1) * strength;
            const finalAlpha = alpha * (1 - blendFactor) + adjusted * blendFactor;
            
            data[i * 4 + 3] = Math.round(Math.max(0, Math.min(255, finalAlpha * 255)));
        }
    }
}

/**
 * Apply softness to edges only, preserving interior detail.
 */
function applyEdgeSoftness(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    strength: number
): void {
    // Create alpha buffer
    const alphaBuffer = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        alphaBuffer[i] = data[i * 4 + 3] / 255;
    }

    // Find edge pixels (where alpha is between 0.05 and 0.95)
    const isEdge = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
        const alpha = alphaBuffer[i];
        isEdge[i] = (alpha > 0.02 && alpha < 0.98) ? 1 : 0;
    }

    // Dilate edge mask based on strength
    const dilationRadius = Math.ceil(strength * 3);
    const edgeMask = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (isEdge[idx]) {
                // Mark surrounding pixels as part of edge region
                for (let dy = -dilationRadius; dy <= dilationRadius; dy++) {
                    for (let dx = -dilationRadius; dx <= dilationRadius; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist <= dilationRadius) {
                                const nidx = ny * width + nx;
                                const falloff = 1 - dist / (dilationRadius + 1);
                                edgeMask[nidx] = Math.max(edgeMask[nidx], falloff);
                            }
                        }
                    }
                }
            }
        }
    }

    // Apply gaussian-like blur only to edge regions
    const blurRadius = Math.ceil(strength * 2) + 1;
    const blurred = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (edgeMask[idx] > 0.01) {
                let sum = 0;
                let weightSum = 0;
                
                for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                    for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                        const ny = Math.max(0, Math.min(height - 1, y + dy));
                        const nx = Math.max(0, Math.min(width - 1, x + dx));
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const weight = Math.exp(-dist * dist / (blurRadius * blurRadius * 0.5));
                        
                        sum += alphaBuffer[ny * width + nx] * weight;
                        weightSum += weight;
                    }
                }
                
                blurred[idx] = sum / weightSum;
            } else {
                blurred[idx] = alphaBuffer[idx];
            }
        }
    }

    // Apply blurred values based on edge mask
    for (let i = 0; i < width * height; i++) {
        const maskStrength = edgeMask[i] * strength;
        const original = alphaBuffer[i];
        const smoothed = blurred[i];
        const final = original * (1 - maskStrength) + smoothed * maskStrength;
        data[i * 4 + 3] = Math.round(Math.max(0, Math.min(255, final * 255)));
    }
}

/**
 * Remove background color spill from edge pixels.
 * This helps with color fringing from the original background.
 */
function applyColorDecontamination(
    data: Uint8ClampedArray,
    _originalData: Uint8ClampedArray,
    width: number,
    height: number,
    strength: number
): void {
    // Find edge pixels
    const alphaBuffer = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
        alphaBuffer[i] = data[i * 4 + 3] / 255;
    }

    // For each semi-transparent pixel, adjust color toward interior pixels
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = y * width + x;
            const alpha = alphaBuffer[idx];
            
            // Only process semi-transparent edge pixels
            if (alpha > 0.05 && alpha < 0.95) {
                const pixelIdx = idx * 4;
                
                // Find the average color of nearby opaque pixels
                let sumR = 0, sumG = 0, sumB = 0, count = 0;
                const searchRadius = 3;
                
                for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                    for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;
                        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                            const nidx = ny * width + nx;
                            const nAlpha = alphaBuffer[nidx];
                            
                            // Only consider more opaque pixels
                            if (nAlpha > alpha + 0.1) {
                                const nPixelIdx = nidx * 4;
                                const weight = nAlpha;
                                sumR += data[nPixelIdx] * weight;
                                sumG += data[nPixelIdx + 1] * weight;
                                sumB += data[nPixelIdx + 2] * weight;
                                count += weight;
                            }
                        }
                    }
                }
                
                if (count > 0) {
                    // Calculate average interior color
                    const avgR = sumR / count;
                    const avgG = sumG / count;
                    const avgB = sumB / count;
                    
                    // Blend toward interior color based on transparency and strength
                    const blendFactor = (1 - alpha) * strength;
                    
                    data[pixelIdx] = Math.round(data[pixelIdx] * (1 - blendFactor) + avgR * blendFactor);
                    data[pixelIdx + 1] = Math.round(data[pixelIdx + 1] * (1 - blendFactor) + avgG * blendFactor);
                    data[pixelIdx + 2] = Math.round(data[pixelIdx + 2] * (1 - blendFactor) + avgB * blendFactor);
                }
            }
        }
    }
}

/**
 * Create a preview of edge detection for debugging/visualization.
 */
export function createEdgePreview(
    _ctx: CanvasRenderingContext2D,
    imageData: ImageData
): ImageData {
    const { width, height } = imageData;
    const data = imageData.data;
    const preview = new Uint8ClampedArray(width * height * 4);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            const alpha = data[idx + 3];
            
            // Check neighbors for edge detection
            const left = data[((y * width) + (x - 1)) * 4 + 3];
            const right = data[((y * width) + (x + 1)) * 4 + 3];
            const up = data[(((y - 1) * width) + x) * 4 + 3];
            const down = data[(((y + 1) * width) + x) * 4 + 3];
            
            const gx = Math.abs(right - left);
            const gy = Math.abs(down - up);
            const edge = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 2);
            
            // Visualize: Red = edge, Green = opaque interior, Blue = transparent
            preview[idx] = edge;
            preview[idx + 1] = alpha > 200 ? 128 : 0;
            preview[idx + 2] = alpha < 50 ? 128 : 0;
            preview[idx + 3] = 255;
        }
    }

    return new ImageData(preview, width, height);
}
