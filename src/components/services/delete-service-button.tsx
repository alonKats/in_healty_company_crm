"use client";

export function DeleteServiceButton() {
  return (
    <button
      type="submit"
      className="text-sm text-destructive hover:underline"
      onClick={(e) => {
        if (!confirm("האם למחוק את המוצר?")) e.preventDefault();
      }}
    >
      מחק מוצר
    </button>
  );
}
