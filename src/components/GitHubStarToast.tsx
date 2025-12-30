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

import React from 'react';
import { X } from 'lucide-react';

interface GitHubStarToastProps {
    show: boolean;
    onClose: () => void;
}

export const GitHubStarToast: React.FC<GitHubStarToastProps> = ({ show, onClose }) => {
    if (!show) return null;

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-zinc-900 text-zinc-100 p-4 rounded-xl shadow-2xl flex items-center gap-4 max-w-sm border border-zinc-800 ring-1 ring-lime-500/20">
                <div className="flex-1">
                    <p className="font-semibold text-sm">Happy with the result?</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Support us with a star on GitHub! ⭐</p>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href="https://github.com/Suvink/cut-it-out"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-lime-500 text-black text-xs font-bold rounded-lg hover:bg-lime-400 transition-colors"
                    >
                        Star
                    </a>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
