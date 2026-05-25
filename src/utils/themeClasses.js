export const getPageTheme = () => ({
  page:
    "min-h-screen p-4 md:p-6 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300",

  container: "max-w-7xl mx-auto",

  card:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-sm)] transition-colors duration-300",

  cardSoft:
    "bg-[var(--color-surface-muted)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl transition-colors duration-300",

  section:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-sm)]",

  header:
    "bg-[var(--color-surface)] text-[var(--color-text)] border-b border-[var(--color-border)]",

  title: "text-[var(--color-text)] font-bold",

  subtitle: "text-[var(--color-text-muted)]",

  muted: "text-[var(--color-text-muted)]",

  iconBox:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-xl",

  iconBoxSecondary:
    "bg-[var(--color-secondary-soft)] text-[var(--color-secondary)] rounded-xl",

  input:
    "w-full min-h-[42px] px-3 py-2 bg-[var(--color-input-bg)] text-[var(--color-text)] border border-[var(--color-border-strong)] rounded-lg placeholder:text-[var(--color-text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)] transition-colors",

  select:
    "w-full min-h-[42px] px-3 py-2 bg-[var(--color-input-bg)] text-[var(--color-text)] border border-[var(--color-border-strong)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)] transition-colors",

  textarea:
    "w-full min-h-[96px] px-3 py-2 bg-[var(--color-input-bg)] text-[var(--color-text)] border border-[var(--color-border-strong)] rounded-lg placeholder:text-[var(--color-text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)] transition-colors",

  primaryButton:
    "inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] bg-[var(--color-primary)] text-white border border-[var(--color-primary)] rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] hover:border-[var(--color-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed",

  secondaryButton:
    "inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border-strong)] rounded-lg font-semibold hover:bg-[var(--color-surface-muted)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed",

  ghostButton:
    "inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] bg-transparent text-[var(--color-text-muted)] border border-transparent rounded-lg font-semibold hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed",

  dangerButton:
    "inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[40px] bg-[var(--color-danger)] text-white border border-[var(--color-danger)] rounded-lg font-semibold hover:bg-[var(--color-danger-hover)] hover:border-[var(--color-danger-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed",

  activeTab:
    "bg-[var(--color-primary)] text-white border border-[var(--color-primary)]",

  inactiveTab:
    "bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]",

  successBadge:
    "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success-border)]",

  warningBadge:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning-border)]",

  dangerBadge:
    "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger-border)]",

  infoBadge:
    "bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info-border)]",

  neutralBadge:
    "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border border-[var(--color-border)]",

  hoverRow:
    "hover:bg-[var(--color-surface-muted)] transition-colors",

  divider: "border-[var(--color-border)]",
})

export const swalTheme = {
  confirmButtonColor: "var(--color-primary)",
  cancelButtonColor: "var(--color-danger)",
  background: "var(--color-surface)",
  color: "var(--color-text)",
}