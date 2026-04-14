import { useState } from "react"
import { Send, Loader } from "lucide-react"
import { saveReflection } from "../../services/userApi"
import Card from "../ui/Card"
import Button from "../ui/Button"

export default function ReflectionForm({ currentAyahRef = "", onSaved }) {
  const [text, setText] = useState("")
  const [ayahRef, setAyahRef] = useState(currentAyahRef)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const charLimit = 500
  const remaining = charLimit - text.length
  const canSubmit = text.trim().length > 10 && !saving

  async function handleSubmit() {
    if (!canSubmit) return
    setSaving(true)
    setError(null)

    try {
      const saved = await saveReflection({ ayahRef, text: text.trim() })
      setText("")

      if (onSaved) onSaved(saved)
    } catch {
      setError("Could not save reflection. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card padding="normal" className="flex flex-col gap-4">
      <div>
        <p
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
          className="text-lg font-semibold mb-0.5"
        >
          Write a Reflection
        </p>
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          What does this ayah mean to you today?
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium" style={{ color: "var(--color-muted)" }}>
          Ayah Reference (e.g. Al-Baqarah 2:255)
        </label>
        <input
          type="text"
          value={ayahRef}
          onChange={(e) => setAyahRef(e.target.value)}
          placeholder="Which ayah are you reflecting on?"
          className="w-full px-4 py-2 rounded-xl text-sm border"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-body)",
            outline: "none",
          }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, charLimit))}
          placeholder="Write your reflection here... What struck you? What will you carry with you today?"
          rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm border resize-none leading-relaxed"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg)",
            color: "var(--color-ink)",
            fontFamily: "var(--font-body)",
            outline: "none",
          }}
        />

        <span
          className="text-xs text-right"
          style={{ color: remaining < 50 ? "#C0392B" : "var(--color-muted)" }}
        >
          {remaining} characters remaining
        </span>
      </div>

      {error && (
        <p className="text-xs" style={{ color: "#C0392B" }}>{error}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        fullWidth
      >
        {saving
          ? <><Loader size={15} className="animate-spin" /> Saving...</>
          : <><Send size={15} /> Save Reflection</>
        }
      </Button>
    </Card>
  )
}