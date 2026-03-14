interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
}

const CHRISTMAS_EMOJIS = [
  // Row 1 - Classic ornaments
  "🎄", "⭐", "❄️", "🎁", "🕯️", "🍪", "❤️", "🔔",
  // Row 2 - Characters & items
  "🎅", "🦌", "⛄", "🌟", "🎀", "🧦", "🎶", "☃️",
  // Row 3 - More variety
  "💝", "🌲", "✨", "🎊", "🍬", "🥛", "🧣", "🎿",
];

export const EmojiPicker = ({ selectedEmoji, onSelect }: EmojiPickerProps) => {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {CHRISTMAS_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`text-2xl p-2 rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-candlelight ${
            selectedEmoji === emoji
              ? "bg-primary/20 ring-2 ring-primary scale-110 shadow-lg"
              : "bg-card hover:bg-secondary/80"
          }`}
          aria-label={`Select ${emoji} ornament`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
