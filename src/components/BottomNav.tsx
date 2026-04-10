import { Dumbbell, BarChart3 } from "lucide-react";

interface BottomNavProps {
  active: "log" | "overview";
  onChange: (tab: "log" | "overview") => void;
}

export default function BottomNav({ active, onChange }: BottomNavProps) {
  const tabs = [
    { key: "log" as const, label: "LOG", icon: Dumbbell },
    { key: "overview" as const, label: "OVERVIEW", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t-2 border-border px-6 py-3 flex justify-around items-center max-w-xl mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon size={20} />
            <span className="font-mono text-[10px] uppercase tracking-widest font-semibold">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
