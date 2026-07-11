"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parse, type ParseFormat } from "@/lib/parser";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: Array<{ name: string; referenceMatrix: Record<string, number> }>) => void;
}

type TabValue = ParseFormat;

const FORMAT_LABELS: Record<TabValue, string> = {
  flopzilla: "Flopzilla",
  anki: "Anki",
  piosolver: "PioSolver",
  simplepostflop: "Simple Postflop",
  json: "JSON",
};

const FORMAT_PLACEHOLDERS: Record<TabValue, string> = {
  flopzilla:
    'AA, AKs-A5s, AKo-AJo, KK, KQs-K9s, QQ, JJs, TT-22',
  anki:
    "AA: 100\nAKs: 50\nAKo: 30\nKK: 100",
  piosolver:
    "AA 100, AKs 50, AKo 30, KK 100",
  simplepostflop:
    '[{"hand": "AA", "weight": 100}, {"hand": "KK", "weight": 80}]',
  json:
    '[{"name": "BTN vs 3bet", "reference_matrix": {"AA": 100, "KK": 100}}]',
};

const FORMAT_HINTS: Record<TabValue, string> = {
  flopzilla:
    "Paste a Flopzilla range string. Supports pairs (AA), suited (AKs), offsuit (AKo), and ranges (AKs-A5s, AA-TT).",
  anki:
    "Paste Anki export lines in format 'hand: weight' or just 'hand' (defaults to 100%).",
  piosolver:
    "Paste PioSolver range output. Supports 'hand weight' or 'hand:weight' format.",
  simplepostflop:
    "Paste Simple Postflop JSON array or line-based 'hand weight' format.",
  json:
    "Paste JSON array with { name, reference_matrix } objects.",
};

export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("flopzilla");
  const [textInput, setTextInput] = useState("");
  const [preview, setPreview] = useState<Array<{ name: string; referenceMatrix: Record<string, number> }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = useCallback(() => {
    setError(null);
    setPreview(null);

    if (!textInput.trim()) {
      setError("Please enter some text to parse.");
      return;
    }

    try {
      const result = parse(textInput, activeTab);
      if (result.length === 0) {
        setError("No valid hands found. Check the format and try again.");
        return;
      }
      setPreview(result);
    } catch {
      setError("Failed to parse input. Check the format and try again.");
    }
  }, [textInput, activeTab]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setTextInput(content);
        setError(null);
        setPreview(null);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    []
  );

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
      onClose();
      setTextInput("");
      setPreview(null);
      setError(null);
    }
  };

  const handleClose = () => {
    onClose();
    setTextInput("");
    setPreview(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Cards</DialogTitle>
          <DialogDescription>
            Paste range text from your poker tool and import it as cards.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as TabValue); setPreview(null); setError(null); }}>
          <TabsList variant="line" className="w-full justify-start">
            {Object.entries(FORMAT_LABELS).map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{FORMAT_HINTS[activeTab]}</p>

            {/* File Upload */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".json,.txt,.csv,.tsv"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload File
              </Button>
              {textInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setTextInput(""); setPreview(null); setError(null); }}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Text Input */}
            <div className="space-y-2">
              <Label>Paste range text</Label>
              <textarea
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setPreview(null);
                  setError(null);
                }}
                className="w-full h-36 px-3 py-2 rounded-lg border border-input bg-transparent text-sm font-mono resize-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
                placeholder={FORMAT_PLACEHOLDERS[activeTab]}
              />
            </div>

            {/* Parse Button */}
            <Button onClick={handleParse} disabled={!textInput.trim()}>
              Parse
            </Button>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Preview */}
            {preview && preview.length > 0 && (
              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-sm font-medium">
                  Preview ({preview.length} card{preview.length !== 1 ? "s" : ""}):
                </p>
                {preview.map((card, i) => {
                  const handCount = Object.keys(card.referenceMatrix).length;
                  const selectedCount = Object.values(card.referenceMatrix).filter((v) => v > 0).length;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm text-muted-foreground"
                    >
                      <span>{card.name}</span>
                      <span className="font-mono text-xs">
                        {selectedCount}/{handCount} hands selected
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!preview || preview.length === 0}>
            Import {preview ? preview.length : 0} Card{preview && preview.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
