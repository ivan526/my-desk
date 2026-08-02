import { Header } from "./Header";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageContainer({ title, subtitle, actions, children }: PageContainerProps) {
  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 bg-bg-card border-b border-bg-tertiary">
        <div>
          <h2 className="text-lg font-medium text-ink-primary">{title}</h2>
          {subtitle && <p className="text-xs text-ink-hint mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </>
  );
}
