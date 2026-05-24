export const getPageTheme = () => ({
  page:
    "min-h-screen p-4 md:p-6 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300",

  container: "max-w-7xl mx-auto",

  card:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-md)] transition-colors duration-300",

  cardSoft:
    "bg-[var(--color-surface-muted)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl transition-colors duration-300",

  section:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-sm)]",

  header:
    "bg-[var(--color-surface-elevated)] text-[var(--color-text)] border-b border-[var(--color-border)]",

  title: "text-[var(--color-text)] font-bold",

  subtitle: "text-[var(--color-text-muted)]",

  muted: "text-[var(--color-text-muted)]",

  iconBox:
    "bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-xl",

  iconBoxSecondary:
    "bg-[var(--color-secondary-soft)] text-[var(--color-secondary)] rounded-xl",

  input:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)]",

  select:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)]",

  textarea:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)] focus:border-[var(--color-primary)]",

  primaryButton:
    "inline-flex items-center justify-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed",

  secondaryButton:
    "inline-flex items-center justify-center px-4 py-2 bg-[var(--color-surface-muted)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-soft)] transition-colors",

  dangerButton:
    "inline-flex items-center justify-center px-4 py-2 bg-[var(--color-danger)] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed",

  successBadge:
    "bg-[var(--color-success-soft)] text-[var(--color-success)] border border-[var(--color-success)]/20",

  warningBadge:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border border-[var(--color-warning)]/20",

  dangerBadge:
    "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border border-[var(--color-danger)]/20",

  infoBadge:
    "bg-[var(--color-info-soft)] text-[var(--color-info)] border border-[var(--color-info)]/20",

  neutralBadge:
    "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] border border-[var(--color-border)]",

  hoverRow:
    "hover:bg-[var(--color-bg-soft)] transition-colors",

  divider: "border-[var(--color-border)]",
})

export const swalTheme = {
  confirmButtonColor: "var(--color-primary)",
  cancelButtonColor: "var(--color-danger)",
  background: "var(--color-surface)",
  color: "var(--color-text)",
}