"use client";

import { useState } from "react";
import { HandMatrix } from "@/components/trainer/HandMatrix";
import { WeightSelector } from "@/components/trainer/WeightSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BetAction {
  player: string;
  action: string;
  amount: number; // in bb
  isMultiplier: boolean; // true = multiply previous, false = absolute bb
  multiplier?: number; // e.g., 3.0 for 3x
}

interface CardData {
  id?: string;
  name: string;
  question: string;
  heroPosition: string;
  villainPosition: string;
  heroStack: number;
  villainStack: number;
  blinds: { small: number; big: number };
  actions: BetAction[];
  referenceMatrix: Record<string, number>;
}

interface CardEditorProps {
  card: CardData;
  onSave: (card: CardData) => void;
  onCancel: () => void;
}

const POSITIONS = ["UTG", "MP", "CO", "BTN", "SB", "BB"];
const ACTION_TYPES = ["open", "3bet", "4bet", "5bet", "call", "limp", "allin"];

const DEFAULT_CARD: CardData = {
  name: "",
  question: "",
  heroPosition: "BTN",
  villainPosition: "MP",
  heroStack: 100,
  villainStack: 100,
  blinds: { small: 0.5, big: 1 },
  actions: [],
  referenceMatrix: {},
};

export default function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const [formData, setFormData] = useState<CardData>({
    ...DEFAULT_CARD,
    ...card,
  });
  const [selectedWeight, setSelectedWeight] = useState<number>(100);

  const handleMatrixChange = (matrix: Record<string, number>) => {
    setFormData((prev) => ({ ...prev, referenceMatrix: matrix }));
  };

  const addAction = () => {
    setFormData((prev) => ({
      ...prev,
      actions: [
        ...prev.actions,
        { player: prev.villainPosition, action: "open", amount: 2.5, isMultiplier: false },
      ],
    }));
  };

  const updateAction = (index: number, field: keyof BetAction, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      ),
    }));
  };

  const removeAction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  // Calculate actual bet amounts for display
  const calculateAmounts = (): string[] => {
    const amounts: string[] = [];
    let lastAmount = formData.blinds.big;
    for (const act of formData.actions) {
      let amt: number;
      if (act.isMultiplier && act.multiplier) {
        amt = lastAmount * act.multiplier;
      } else {
        amt = act.amount;
      }
      amounts.push(`${amt.toFixed(1)}bb`);
      lastAmount = amt;
    }
    return amounts;
  };

  const amounts = calculateAmounts();

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">
        {card.id ? "Редактировать карточку" : "Новая карточка"}
      </h3>

      {/* Basic Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Название</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="BTN vs 3bet от MP"
          />
        </div>

        <div className="space-y-2">
          <Label>Вопрос</Label>
          <Input
            value={formData.question}
            onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
            placeholder="Что я колирую на 3бет?"
          />
        </div>

        <div className="space-y-2">
          <Label>Позиция Hero</Label>
          <select
            value={formData.heroPosition}
            onChange={(e) => setFormData((prev) => ({ ...prev, heroPosition: e.target.value }))}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Позиция оппонента</Label>
          <select
            value={formData.villainPosition}
            onChange={(e) => setFormData((prev) => ({ ...prev, villainPosition: e.target.value }))}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Стек Hero (bb)</Label>
          <Input
            type="number"
            value={formData.heroStack}
            onChange={(e) => setFormData((prev) => ({ ...prev, heroStack: parseInt(e.target.value) || 100 }))}
            min={1}
            max={1000}
          />
        </div>

        <div className="space-y-2">
          <Label>Стек оппонента (bb)</Label>
          <Input
            type="number"
            value={formData.villainStack}
            onChange={(e) => setFormData((prev) => ({ ...prev, villainStack: parseInt(e.target.value) || 100 }))}
            min={1}
            max={1000}
          />
        </div>
      </div>

      {/* Action History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>История действий</Label>
          <Button size="sm" variant="outline" onClick={addAction}>
            + Добавить действие
          </Button>
        </div>

        <div className="space-y-2">
          {formData.actions.map((act, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[#1a1d27] border border-[#242836]">
              <span className="text-xs text-[#64748b] w-6">#{i + 1}</span>

              <select
                value={act.player}
                onChange={(e) => updateAction(i, "player", e.target.value)}
                className="h-7 rounded border border-[#242836] bg-[#0f1117] px-2 text-xs text-[#e2e8f0]"
              >
                <option value={formData.heroPosition}>{formData.heroPosition}</option>
                <option value={formData.villainPosition}>{formData.villainPosition}</option>
              </select>

              <select
                value={act.action}
                onChange={(e) => updateAction(i, "action", e.target.value)}
                className="h-7 rounded border border-[#242836] bg-[#0f1117] px-2 text-xs text-[#e2e8f0]"
              >
                {ACTION_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>

              {/* Multiplier toggle */}
              <label className="flex items-center gap-1 text-xs text-[#94a3b8]">
                <input
                  type="checkbox"
                  checked={act.isMultiplier}
                  onChange={(e) => updateAction(i, "isMultiplier", e.target.checked)}
                  className="w-3 h-3"
                />
                x
              </label>

              {act.isMultiplier ? (
                <Input
                  type="number"
                  value={act.multiplier || 3}
                  onChange={(e) => updateAction(i, "multiplier", parseFloat(e.target.value) || 3)}
                  step={0.1}
                  min={1}
                  max={20}
                  className="h-7 w-16 text-xs"
                />
              ) : (
                <Input
                  type="number"
                  value={act.amount}
                  onChange={(e) => updateAction(i, "amount", parseFloat(e.target.value) || 0)}
                  step={0.5}
                  min={0}
                  className="h-7 w-16 text-xs"
                />
              )}

              <span className="text-xs text-[#e8834A] font-mono min-w-[40px]">
                {amounts[i]}
              </span>

              <button
                onClick={() => removeAction(i)}
                className="text-[#ef4444] hover:text-[#dc2626] text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}

          {formData.actions.length === 0 && (
            <div className="text-xs text-[#64748b] italic p-2">
              Добавьте действия для отображения на столе
            </div>
          )}
        </div>
      </div>

      {/* Reference Matrix */}
      <div className="space-y-3">
        <Label>Эталонная матрица</Label>
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

      {/* Save/Cancel */}
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave}>Сохранить</Button>
        <Button variant="outline" onClick={onCancel}>Отмена</Button>
      </div>
    </div>
  );
}
