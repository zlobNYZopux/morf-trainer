'use client';

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
  const handleCreate = () => {
    const name = prompt('Deck name:');
    if (name?.trim()) {
      onCreateDeck(name.trim());
    }
  };

  return (
    <div className="w-64 border-r border-border bg-card h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold mb-3">Decks</h2>
        <button
          onClick={handleCreate}
          className="w-full py-2 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          + New Deck
        </button>
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
                    ? 'bg-primary/10 border-l-2 border-l-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onSelectDeck(deck.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{deck.name}</p>
                    <p className="text-xs text-muted-foreground">{deck.cardCount} cards</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this deck?')) {
                        onDeleteDeck(deck.id);
                      }
                    }}
                    className="text-xs text-destructive hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
