import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { BookOpen, LayoutDashboard, Menu, X } from "lucide-react"

const NAV_LINKS = [
  { label: "Read", path: "/reader", icon: BookOpen },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav
      style={{
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="flex items-center gap-2 no-underline"
          onClick={() => setMenuOpen(false)}
        >
          <span
            className="arabic-text text-2xl leading-none"
            style={{ color: "var(--color-teal)" }}
          >
            ق
          </span>
          <span
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-ink)" }}
            className="text-xl font-semibold tracking-wide"
          >
            QuranReconnect
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const { label, path } = link

            return (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium no-underline transition-all"
                style={{
                  color: isActive(path) ? "var(--color-teal)" : "var(--color-ink-light)",
                  backgroundColor: isActive(path) ? "rgba(45,125,111,0.08)" : "transparent",
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </div>

        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "var(--color-ink)" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="md:hidden px-5 pb-4 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const { label, path } = link

            return (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline"
                style={{
                  color: isActive(path) ? "var(--color-teal)" : "var(--color-ink)",
                  backgroundColor: isActive(path) ? "rgba(45,125,111,0.08)" : "transparent",
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}