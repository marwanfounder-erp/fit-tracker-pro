import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const navLinks = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/users", label: "Users", icon: Users, end: false },
  ];

  const NavItems = () => (
    <>
      {navLinks.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-iron-medium"
            }`
          }
        >
          <Icon size={14} />
          {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-dvh bg-background flex">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-56 shrink-0 border-r-2 border-border bg-card flex-col">
        <div className="p-4 border-b-2 border-border">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Iron Protocol
          </p>
          <h1 className="text-lg font-bold tracking-tighter uppercase italic text-foreground leading-tight">
            Admin Panel
          </h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavItems />
        </nav>

        <div className="p-3 border-t-2 border-border space-y-1">
          <div className="px-3 py-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Signed in as
            </p>
            <p className="font-mono text-xs text-foreground truncate">
              {profile?.full_name || profile?.email}
            </p>
            <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-primary text-primary-foreground font-mono text-[9px] uppercase tracking-widest">
              admin
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-iron-medium transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b-2 border-border flex items-center justify-between px-4 py-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Iron Protocol</p>
          <h1 className="text-base font-bold tracking-tighter uppercase italic text-foreground leading-tight">Admin Panel</h1>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-muted-foreground hover:text-foreground transition-colors">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-card border-b-2 border-border" onClick={(e) => e.stopPropagation()}>
            <nav className="p-3 space-y-1">
              <NavItems />
            </nav>
            <div className="p-3 border-t border-border">
              <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto md:pt-0 pt-14">
        <Outlet />
      </main>
    </div>
  );
}
