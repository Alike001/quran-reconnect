export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div
        className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-teal)" }}
      />
      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
        {message}
      </p>
    </div>
  )
}