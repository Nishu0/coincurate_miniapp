interface Tab {
  id: string;
  label: string;
}

interface TabGroupProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function TabGroup({ tabs, activeTab, onChange, className = '' }: TabGroupProps) {
  return (
    <div className={`flex justify-center mb-5 ${className}`}>
      <div className="flex border-b border-[var(--app-gray)] w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center py-2 px-4 text-sm font-medium flex-1 ${
              activeTab === tab.id
                ? "text-[var(--app-accent)] border-b-2 border-[var(--app-accent)]" 
                : "text-[var(--app-foreground-muted)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
} 