import type { HTMLAttributes, ReactNode } from 'react'

const cx = (...v: Array<string | undefined | false>) => v.filter(Boolean).join(' ')

export function LLCard({ className, interactive, children, ...props }: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return <section className={cx('ll-card', interactive && 'is-interactive', className)} {...props}>{children}</section>
}
export function LLCardHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return <header className="ll-card-header"><div><h3 className="ll-card-title">{title}</h3>{subtitle && <p className="ll-card-subtitle">{subtitle}</p>}</div>{actions}</header>
}
export function LLCardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cx('ll-card-body', className)} {...props} /> }
export function LLCardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <footer className={cx('ll-card-footer', className)} {...props} /> }

export function LLStat({ icon, label, value, meta, className }: { icon?: ReactNode; label: ReactNode; value: ReactNode; meta?: ReactNode; className?: string }) {
  return <div className={cx('ll-card ll-stat', className)}>{icon && <span className="ll-stat-icon">{icon}</span>}<div className="ll-stat-copy"><span className="ll-stat-label">{label}</span><strong className="ll-stat-value">{value}</strong>{meta && <small className="ll-stat-meta">{meta}</small>}</div></div>
}

export function LLToolbar({ children, className }: HTMLAttributes<HTMLDivElement>) { return <div className={cx('ll-toolbar', className)}>{children}</div> }
export function LLToolbarGroup({ children, className }: HTMLAttributes<HTMLDivElement>) { return <div className={cx('ll-toolbar-group', className)}>{children}</div> }

export function LLButton({ variant='default', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'primary'|'danger' }) {
  return <button className={cx('ll-btn', variant === 'primary' && 'll-btn-primary', variant === 'danger' && 'll-btn-danger', className)} {...props} />
}
export function LLBadge({ tone='default', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: 'default'|'primary'|'success'|'warning'|'danger' }) {
  return <span className={cx('ll-badge', tone !== 'default' && `ll-badge-${tone}`, className)} {...props} />
}
export function LLTableFrame({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cx('ll-table-frame', className)} {...props}>{children}</div> }
export function LLEmpty({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cx('ll-empty', className)} {...props}><div>{children}</div></div> }
