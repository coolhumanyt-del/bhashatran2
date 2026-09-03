/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Languages, Trash2, ArrowRightLeft, Loader2, Copy, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Language = 'Hindi' | 'Punjabi';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLang, setSourceLang] = useState<Language>('Hindi');
  const [targetLang, setTargetLang] = useState<Language>('Punjabi');
  const [isLoading, setIsLoading] = useState(false);
  const [inputCopied, setInputCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional translator. Translate the following text from ${sourceLang} to ${targetLang} with high accuracy and natural flow. Provide ONLY the translated text.\n\nText: ${inputText}`,
      });

      const translatedText = response.text || '';
      setOutputText(translatedText.trim());
    } catch (error) {
      console.error('Translation error:', error);
      setOutputText('Error: Could not translate text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'input' | 'output') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'input') {
      setInputCopied(true);
      setTimeout(() => setInputCopied(false), 2000);
    } else {
      setOutputCopied(true);
      setTimeout(() => setOutputCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-slate-900 rounded-2xl mb-4 shadow-xl">
            <Languages className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-2 text-slate-900">
            BhashaTrans
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">
            Hindi ↔ Punjabi Translator
          </p>
        </header>

        {/* Language Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex-1 text-right">
            <span className="text-xl font-black uppercase text-slate-700">{sourceLang}</span>
          </div>
          <button
            onClick={handleSwap}
            className="p-3 bg-slate-900 text-white rounded-full hover:scale-110 transition-transform active:scale-95 shadow-lg"
            title="Swap Languages"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-left">
            <span className="text-xl font-black uppercase text-slate-700">{targetLang}</span>
          </div>
        </div>

        {/* Translation Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Input Box */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-slate-200 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter text in ${sourceLang}...`}
                className="w-full h-80 p-6 text-xl font-medium focus:outline-none resize-none placeholder:text-slate-300"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => copyToClipboard(inputText, 'input')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Copy Input"
                >
                  {inputCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 opacity-40 hover:opacity-100" />}
                </button>
                <button
                  onClick={handleClear}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Clear Text"
                >
                  <Trash2 className="w-5 h-5 opacity-40 hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>

          {/* Output Box */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-slate-200 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className={cn(
                "w-full h-80 p-6 text-xl font-medium overflow-y-auto whitespace-pre-wrap",
                !outputText && "text-slate-300 italic"
              )}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : (
                  outputText || "Translation will appear here..."
                )}
              </div>
              {outputText && !isLoading && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={() => copyToClipboard(outputText, 'output')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy Translation"
                  >
                    {outputCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 opacity-40 hover:opacity-100" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="px-12 py-4 bg-slate-900 text-white text-xl font-black uppercase tracking-widest rounded-2xl shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
          <button
            onClick={handleClear}
            className="px-12 py-4 border-2 border-slate-200 text-slate-600 text-xl font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
