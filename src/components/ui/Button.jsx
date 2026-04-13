export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  type = "button",
  className = "",
}) {

  const base = `
    inline-flex items-center justify-center gap-2 font-medium
    rounded-xl cursor-pointer border transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
    ${className}
  `

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  }

  const variants = {
    primary: `
      text-white border-transparent
      hover:opacity-90 active:scale-95
    `,
    secondary: `
      bg-transparent
      hover:bg-opacity-10 active:scale-95
    `,
    ghost: `
      bg-transparent border-transparent
      hover:bg-opacity-10 active:scale-95
    `,
  }
  
  const variantStyles = {
    primary:   { backgroundColor: "var(--color-teal)", color: "white" },
    secondary: { borderColor: "var(--color-teal)", color: "var(--color-teal)", backgroundColor: "transparent" },
    ghost:     { color: "var(--color-ink-light)", backgroundColor: "transparent" },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
      style={variantStyles[variant]}
    >
      {children}
    </button>
  )
}