"use client";

import { useState } from "react";
import { HandMatrix } from "@/components/trainer/HandMatrix";
import { WeightSelector } from "@/components/trainer/WeightSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CardData {
  id?: string;
  name: string;
  question: string;
  heroPosition: string;
  villainPosition: string;
  action: string;
  stack: number;
  referenceMatrix: Record<string, number>;
}

interface CardEditorProps {
  card: CardData;
  onSave: (card: CardData) => void;
  onCancel: () => void;
}

const POSITIONS = ["BTN", "SB", "BB", "UTG", "MP", "CO"];
const ACTIONS = ["open", "3bet", "4bet", "call", "limp", "squeeze", "fold", "check"];

const EMPTY_MATRIX: Record<string, number> = {};

export default function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const [formData, setFormData] = useState<CardData>({
    name: card.name || "",
    question: card.question || "",
    heroPosition: card.heroPosition || "BTN",
    villainPosition: card.villainPosition || "MP",
    action: card.action || "open",
    stack: card.stack || 100,
    referenceMatrix: card.referenceMatrix || { ...EMPTY_MATRIX },
  });
  const [selectedWeight, setSelectedWeight] = useState<number>(100);

  const handleMatrixChange = (matrix: Record<string, number>) => {
    setFormData((prev) => ({
      ...prev,
      referenceMatrix: matrix,
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {card.id ? "Edit Card" : "New Card"}
      </h3>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="card-name">Name</Label>
          <Input
            id="card-name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g. BTN vs 3bet from MP"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-question">Question</Label>
          <Input
            id="card-question"
            value={formData.question}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, question: e.target.value }))
            }
            placeholder="e.g. What do I call vs 3bet?"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-position">Hero Position</Label>
          <select
            id="hero-position"
            value={formData.heroPosition}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, heroPosition: e.target.value }))
            }
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="villain-position">Villain Position</Label>
          <select
            id="villain-position"
            value={formData.villainPosition}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                villainPosition: e.target.value,
              }))
            }
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="action">Action</Label>
          <select
            id="action"
            value={formData.action}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, action: e.target.value }))
            }
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {ACTIONS.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stack">Stack (big blinds)</Label>
          <Input
            id="stack"
            type="number"
            value={formData.stack}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                stack: parseInt(e.target.value) || 100,
              }))
            }
            min={1}
            max={1000}
          />
        </div>
      </div>

      {/* Reference Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Reference Matrix</Label>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
              Pairs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30" />
              Suited
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-orange-500/20 border border-orange-500/30" />
              Offsuit
            </span>
            <span className="text-muted-foreground/60">
              Drag to paint cells with selected weight
            </span>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
            <HandMatrix
              matrix={formData.referenceMatrix}
              onChange={handleMatrixChange}
              mode="input"
              selectedWeight={selectedWeight}
            />
          </div>
          <div className="pt-4">
            <WeightSelector
              selectedWeight={selectedWeight}
              onSelectWeight={setSelectedWeight}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave}>Save Card</Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
