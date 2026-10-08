import { useState } from "react";

import "./BookCover.css";

// =====================================================
// CURATED GRADIENT PALETTES
// Picked by hash so the same book always gets the same
// cover, and the palette stays deep and readable instead
// of looking randomly generated.
// =====================================================

const PALETTES = [
  ["#1e3a8a", "#3b82f6"],
  ["#0f766e", "#14b8a6"],
  ["#4c1d95", "#8b5cf6"],
  ["#7c2d12", "#ea580c"],
  ["#134e4a", "#0d9488"],
  ["#1e40af", "#6366f1"],
  ["#831843", "#db2777"],
  ["#3f3f46", "#71717a"],
  ["#14532d", "#22c55e"],
  ["#7f1d1d", "#dc2626"],
  ["#164e63", "#0891b2"],
  ["#422006", "#a16207"],
];

const hashString = (value = "") => {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
};

// =====================================================
// BOOK COVER
// Renders a real image when coverUrl is set, otherwise a
// generated gradient cover. Falls back to the generated
// cover if the image fails to load.
// =====================================================

const BookCover = ({
  title = "",
  author = "",
  isbn = "",
  coverUrl = "",
  size = "md",
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const [from, to] =
    PALETTES[hashString(isbn || title) % PALETTES.length];

  // Real cover image
  if (coverUrl && !imageFailed) {
    return (
      <div className={`book-cover ${size}`}>
        <img
          src={coverUrl}
          alt={title || "Book cover"}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  // Generated cover
  return (
    <div
      className={`book-cover ${size}`}
      style={{
        background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      <div className="book-cover-spine" />

      <div className="book-cover-body">
        <span className="book-cover-title">
          {title || "Untitled"}
        </span>

        {author && (
          <span className="book-cover-author">
            {author}
          </span>
        )}
      </div>
    </div>
  );
};

export default BookCover;
