import { useNavigate } from "react-router-dom"
import { ArrowRight, BookOpen, Flame, Star } from "lucide-react"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

const FEATURES = [
  {
    icon: "📖",
    title: "Daily Ayah",
    description: "A new verse every day with Arabic text, translation, and tafsir.",
  },
  {
    icon: "🔥",
    title: "Streak Tracker",
    description: "Build a consistent habit. Your streak grows every day you read.",
  },
  {
    icon: "🔖",
    title: "Bookmarks",
    description: "Save ayahs that move you. Return to them anytime.",
  },
  {
    icon: "✍️",
    title: "Reflections",
    description: "Write a short reflection on what you read. Build a personal journal.",
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-5">

      <section className="pt-20 pb-16 text-center flex flex-col items-center gap-6">

        <p
          className="arabic-text"
          style={{ color: "var(--color-teal)", fontSize: "2rem" }}
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </p>

        <h1
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
          className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl"
        >
          Stay Connected to the Quran — Every Day
        </h1>

        <p
          className="text-lg max-w-xl leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          Ramadan ends, but your connection doesn't have to. Build a daily Quran
          habit with guided reading, reflections, and a streak that keeps you going.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button size="lg" onClick={() => navigate("/reader")}>
            Start Reading <ArrowRight size={18} />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate("/dashboard")}>
            View Dashboard
          </Button>
        </div>
      </section>

      <div
        className="w-24 h-px mx-auto mb-16"
        style={{ backgroundColor: "var(--color-gold)" }}
      />

      <section className="pb-20">
        <h2
          style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
          className="text-3xl font-semibold text-center mb-10"
        >
          Everything you need to stay consistent
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="flex flex-col gap-3">
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <h3
                  style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
                  className="text-xl font-semibold mb-1"
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <Card padding="large" className="text-center flex flex-col items-center gap-4">
          <span className="text-4xl">🌙</span>
          <h2
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
            className="text-2xl font-semibold"
          >
            Your Ramadan momentum doesn't have to stop.
          </h2>
          <p className="text-sm max-w-md" style={{ color: "var(--color-muted)" }}>
            Thousands of Muslims lose their Quran habit after Ramadan. QuranReconnect
            makes it simple to keep going — one ayah at a time.
          </p>
          <Button onClick={() => navigate("/reader")}>
            Begin Today <ArrowRight size={16} />
          </Button>
        </Card>
      </section>

    </div>
  )
}