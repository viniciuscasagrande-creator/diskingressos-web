import React from 'react';

type MetaItem = { label: string; value: React.ReactNode };

type Props = {
  title: React.ReactNode;
  status?: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: MetaItem[];
  actions?: React.ReactNode;
};

export function MobileListCard({ title, status, subtitle, meta = [], actions }: Props) {
  return (
    <article className="mobile-list-card">
      <div className="mobile-list-card__top">
        <div>
          <strong>{title}</strong>
          {subtitle ? <div className="page-subtitle">{subtitle}</div> : null}
        </div>
        {status}
      </div>
      {meta.length ? (
        <div className="mobile-list-card__meta">
          {meta.map((item) => (
            <div key={item.label}>
              <small>{item.label}</small>
              <div>{item.value}</div>
            </div>
          ))}
        </div>
      ) : null}
      {actions ? <div className="toolbar-actions" style={{ marginTop: 10 }}>{actions}</div> : null}
    </article>
  );
}
