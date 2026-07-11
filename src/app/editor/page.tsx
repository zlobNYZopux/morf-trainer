"use client";

import { useState } from "react";
import Link from "next/link";
import DeckEditor from "@/components/editor/DeckEditor";
import CardEditor from "@/components/editor/CardEditor";
import ImportDialog from "@/components/editor/ImportDialog";
import { Button } from "@/components/ui/button";

interface Card {
  id?: string;
  name: string;
  question: string;
  heroPosition: string;
  villainPosition: string;
  heroStack: number;
  villainStack: number;
  blinds: { small: number; big: number };
  actions: Array<{
    player: string;
    action: string;
    amount: number;
    isMultiplier: boolean;
    multiplier?: number;
  }>;
  referenceMatrix: Record<string, number>;
}

interface Deck {
  id: string;
  name: string;
  cards: Card[];
}

const initialDecks: Deck[] = [
  {
    id: "deck-001",
    name: "3bet Spots",
    cards: [
      {
        id: "card-001",
        name: "BTN vs 3bet from MP",
        question: "Что я колирую на 3бет?",
        heroPosition: "BTN",
        villainPosition: "MP",
        heroStack: 100,
        villainStack: 100,
        blinds: { small: 0.5, big: 1 },
        actions: [
          { player: "MP", action: "open", amount: 2.5, isMultiplier: false },
          { player: "BTN", action: "3bet", amount: 0, isMultiplier: true, multiplier: 3 },
          { player: "MP", action: "call", amount: 0, isMultiplier: false },
        ],
        referenceMatrix: { AA: 100, KK: 100, QQ: 100 },
      },
    ],
  },
];

export default function EditorPage() {
  const [decks, setDecks] = useState<Deck[]>(initialDecks);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const selectedDeck = decks.find((d) => d.id === selectedDeckId);

  const handleCreateDeck = (name: string) => {
    const newDeck: Deck = {
      id: `deck-${Date.now()}`,
      name,
      cards: [],
    };
    setDecks((prev) => [...prev, newDeck]);
    setSelectedDeckId(newDeck.id);
  };

  const handleDeleteDeck = (id: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
    if (selectedDeckId === id) {
      setSelectedDeckId(null);
      setEditingCard(null);
    }
  };

  const handleSaveCard = (cardData: Card) => {
    if (!selectedDeckId) return;

    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== selectedDeckId) return deck;

        if (cardData.id) {
          return {
            ...deck,
            cards: deck.cards.map((c) =>
              c.id === cardData.id ? cardData : c
            ),
          };
        } else {
          const newCard = { ...cardData, id: `card-${Date.now()}` };
          return { ...deck, cards: [...deck.cards, newCard] };
        }
      })
    );
    setEditingCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
    if (!selectedDeckId) return;
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== selectedDeckId) return deck;
        return { ...deck, cards: deck.cards.filter((c) => c.id !== cardId) };
      })
    );
  };

  const handleImport = (
    importedCards: Array<{ name: string; referenceMatrix: Record<string, number> }>
  ) => {
    if (!selectedDeckId) return;

    const newCards: Card[] = importedCards.map((c, i) => ({
      id: `card-imported-${Date.now()}-${i}`,
      name: c.name,
      question: "",
      heroPosition: "BTN",
      villainPosition: "MP",
      action: "open",
      stack: 100,
      referenceMatrix: c.referenceMatrix,
    }));

    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== selectedDeckId) return deck;
        return { ...deck, cards: [...deck.cards, ...newCards] };
      })
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Dashboard
            </Link>
            <h1 className="text-lg font-semibold">Deck Editor</h1>
          </div>
          {selectedDeckId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
            >
              Import Cards
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Deck List */}
        <DeckEditor
          decks={decks.map((d) => ({
            id: d.id,
            name: d.name,
            cardCount: d.cards.length,
          }))}
          selectedDeckId={selectedDeckId}
          onSelectDeck={(id) => {
            setSelectedDeckId(id);
            setEditingCard(null);
          }}
          onCreateDeck={handleCreateDeck}
          onDeleteDeck={handleDeleteDeck}
        />

        {/* Right Panel: Cards List + Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedDeck ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Select a deck or create a new one
            </div>
          ) : editingCard ? (
            <CardEditor
              card={editingCard}
              onSave={handleSaveCard}
              onCancel={() => setEditingCard(null)}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{selectedDeck.name}</h2>
                <Button
                  size="sm"
                  onClick={() =>
                    setEditingCard({
                      name: "",
                      question: "",
                      heroPosition: "BTN",
                      villainPosition: "MP",
                      action: "open",
                      stack: 100,
                      referenceMatrix: {},
                    })
                  }
                >
                  + Add Card
                </Button>
              </div>

              {selectedDeck.cards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No cards yet. Add one or import from a file.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDeck.cards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{card.name || "Untitled Card"}</p>
                        <p className="text-sm text-muted-foreground">
                          {card.heroPosition} vs {card.villainPosition} — {card.action}
                          {card.question && ` — ${card.question}`}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCard(card)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => card.id && handleDeleteCard(card.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
