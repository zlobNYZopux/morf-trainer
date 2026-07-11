'use client';

import { useState, useRef } from 'react';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: Array<{ name: string; referenceMatrix: Record<string, number> }>) => void;
}

type ImportFormat = 'anki' | 'flopzilla' | 'piosolver' | 'simplepostflop' | 'json';

const tabs: { id: ImportFormat; label: string }[] = [
  { id: 'anki', label: 'Anki' },
  { id: 'flopzilla', label: 'Flopzilla' },
  { id: 'piosolver', label: 'PioSolver' },
  { id: 'simplepostflop', label: 'Simple Postflop' },
  { id: 'json', label: 'JSON' },
];

export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [activeTab, setActiveTab] = useState<ImportFormat>('json');
  const [textInput, setTextInput] = useState('');
  const [preview, setPreview] = useState<Array<{ name: string; referenceMatrix: Record<string, number> }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTextInput(content);
      parseInput(content, activeTab);
    };
    reader.readAsText(file);
  };

  const parseInput = (input: string, format: ImportFormat) => {
    setError(null);
    try {
      if (format === 'json') {
        const parsed = JSON.parse(input);
        const cards = Array.isArray(parsed) ? parsed : [parsed];
        setPreview(cards.map((c: Record<string, unknown>) => ({
          name: (c.name as string) || 'Imported Card',
          referenceMatrix: (c.reference_matrix as Record<string, number>) || {},
        })));
      } else {
        setPreview([{
          name: `Imported from ${format}`,
          referenceMatrix: {},
        }]);
      }
    } catch {
      setError('Failed to parse input. Check the format and try again.');
      setPreview(null);
    }
  };

  const handleImport = () => {
    if (preview) {
      onImport(preview);
      onClose();
      setTextInput('');
      setPreview(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Import Cards</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            {activeTab === 'json'
              ? 'Paste JSON array with { name, reference_matrix } objects'
              : `Upload a ${activeTab} export file`}
          </p>

          {/* File Upload */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".json,.txt,.csv"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
            >
              Upload File
            </button>
          </div>

          {/* Text Input */}
          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              if (e.target.value.trim()) {
                parseInput(e.target.value, activeTab);
              } else {
                setPreview(null);
              }
            }}
            className="w-full h-32 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono resize-none"
            placeholder={activeTab === 'json'
              ? '[{"name": "BTN vs 3bet", "reference_matrix": {"AA": 100, "KK": 100}}]'
              : 'Paste file contents here...'
            }
          />

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium mb-2">Preview ({preview.length} cards):</p>
              {preview.slice(0, 5).map((card, i) => (
                <div key={i} className="text-sm text-muted-foreground">
                  {card.name} — {Object.keys(card.referenceMatrix).length} hands
                </div>
              ))}
              {preview.length > 5 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ... and {preview.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!preview || preview.length === 0}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {preview ? preview.length : 0} Cards
          </button>
        </div>
      </div>
    </div>
  );
}
