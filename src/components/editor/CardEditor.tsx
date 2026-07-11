'use client';

import { useState } from 'react';

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

const positions = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];
const actions = ['open', '3bet', '4bet', 'call', 'limp', 'squeeze'];

const defaultMatrix: Record<string, number> = {
  AA: 100, AKs: 100, AQs: 100, AJs: 100, ATs: 100,
  A9s: 0, A8s: 0, A7s: 0, A6s: 0, A5s: 100,
  A4s: 0, A3s: 0, A2s: 0,
  AKo: 100, AQo: 100, AJo: 100, ATo: 0,
  KK: 100, KQs: 100, KJs: 100, KTs: 0,
  KQo: 0, KJo: 0,
  QQ: 100, JJs: 100, JTs: 0,
  TT: 100, 99: 100, 88: 0, 77: 0,
  66: 0, 55: 0, 44: 0, 33: 0, 22: 0,
};

export default function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const [formData, setFormData] = useState<CardData>({
    name: card.name || '',
    question: card.question || '',
    heroPosition: card.heroPosition || 'BTN',
    villainPosition: card.villainPosition || 'MP',
    action: card.action || 'open',
    stack: card.stack || 100,
    referenceMatrix: card.referenceMatrix || { ...defaultMatrix },
  });

  const handleMatrixChange = (hand: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      referenceMatrix: { ...prev.referenceMatrix, [hand]: value },
    }));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 className="font-semibold text-lg">{card.id ? 'Edit Card' : 'New Card'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            placeholder="e.g. BTN vs 3bet from MP"
          />
        </div>

        {/* Question */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Question</label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            placeholder="e.g. What do I call vs 3bet?"
          />
        </div>

        {/* Hero Position */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Hero Position</label>
          <select
            value={formData.heroPosition}
            onChange={(e) => setFormData((prev) => ({ ...prev, heroPosition: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            {positions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        {/* Villain Position */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Villain Position</label>
          <select
            value={formData.villainPosition}
            onChange={(e) => setFormData((prev) => ({ ...prev, villainPosition: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            {positions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        {/* Action */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Action</label>
          <select
            value={formData.action}
            onChange={(e) => setFormData((prev) => ({ ...prev, action: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
          >
            {actions.map((act) => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        {/* Stack */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Stack (big blinds)</label>
          <input
            type="number"
            value={formData.stack}
            onChange={(e) => setFormData((prev) => ({ ...prev, stack: parseInt(e.target.value) || 100 }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            min="1"
            max="1000"
          />
        </div>
      </div>

      {/* Reference Matrix */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Reference Matrix</label>
        <div className="grid grid-cols-9 gap-1">
          {Object.entries(formData.referenceMatrix).map(([hand, value]) => (
            <div key={hand} className="flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground">{hand}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => handleMatrixChange(hand, parseInt(e.target.value))}
                className="w-full h-1"
              />
              <span className="text-[10px] font-mono">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(formData)}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90"
        >
          Save Card
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-border font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
