"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Deck {
  id: string;
  name: string;
  cardCount: number;
}

interface DeckEditorProps {
  decks: Deck[];
  selectedDeckId: string | null;
  onSelectDeck: (id: string) => void;
  onCreateDeck: (name: string) => void;
  onDeleteDeck: (id: string) => void;
}

export default function DeckEditor({
  decks,
  selectedDeckId,
  onSelectDeck,
  onCreateDeck,
  onDeleteDeck,
}: DeckEditorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const handleCreateSubmit = () => {
    if (newDeckName.trim()) {
      onCreateDeck(newDeckName.trim());
      setNewDeckName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card h-full flex flex-col">
      <div className="p-4 border-b border-border space-y-3">
        <h2 className="font-semibold text-sm">Decks</h2>
        {isCreating ? (
          <div className="space-y-2">
            <Input
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              placeholder="Deck name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateSubmit();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewDeckName("");
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateSubmit}>
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setIsCreating(false); setNewDeckName(""); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={() => setIsCreating(true)}
          >
            + New Deck
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {decks.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No decks yet</p>
        ) : (
          <ul>
            {decks.map((deck) => (
              <li
                key={deck.id}
                className={`px-4 py-3 cursor-pointer border-b border-border transition-colors ${
                  selectedDeckId === deck.id
                    ? "bg-primary/10 border-l-2 border-l-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectDeck(deck.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{deck.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {deck.cardCount} card{deck.cardCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${deck.name}"?`)) {
                        onDeleteDeck(deck.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    ×
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
