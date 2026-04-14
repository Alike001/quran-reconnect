import { Bookmark } from "lucide-react"

export default function BookmarkButton({ isBookmarked, onToggle, size = "md" }) {
  const sizes = {
    sm: { btn: "w-8 h-8", icon: 15 },
    md: { btn: "w-10 h-10", icon: 18 },
    lg: { btn: "w-12 h-12", icon: 20 },
  }
  const { btn, icon } = sizes[size]

  return (
    <button
      onClick={onToggle}
      className={`${btn} rounded-xl flex items-center justify-center transition-all active:scale-90`}
      style={{
        backgroundColor: isBookmarked
          ? "rgba(201,168,76,0.15)"
          : "rgba(0,0,0,0.04)",
        color: isBookmarked ? "var(--color-gold)" : "var(--color-muted)",
        border: "none",
        cursor: "pointer",
      }}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this ayah"}
      title={isBookmarked ? "Remove bookmark" : "Save ayah"}
    >
      <Bookmark
        size={icon}
        fill={isBookmarked ? "var(--color-gold)" : "none"}
      />
    </button>
  )
}