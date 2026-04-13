import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Eye, X, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "user";
  created_at: string;
}

interface UserWithStats extends Profile {
  workout_count: number;
  food_count: number;
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [creating, setCreating] = useState(false);

  const { data: users = [], isLoading } = useQuery<UserWithStats[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await sb
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get workout and food counts per user
      const [{ data: wLogs }, { data: fLogs }] = await Promise.all([
        sb.from("workout_logs").select("user_id"),
        sb.from("food_logs").select("user_id"),
      ]);

      const wCount: Record<string, number> = {};
      const fCount: Record<string, number> = {};
      (wLogs ?? []).forEach((r: { user_id: string }) => {
        wCount[r.user_id] = (wCount[r.user_id] ?? 0) + 1;
      });
      (fLogs ?? []).forEach((r: { user_id: string }) => {
        fCount[r.user_id] = (fCount[r.user_id] ?? 0) + 1;
      });

      return (profiles ?? []).map((p: Profile) => ({
        ...p,
        workout_count: wCount[p.id] ?? 0,
        food_count: fCount[p.id] ?? 0,
      }));
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email: form.email, password: form.password, full_name: form.full_name }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        toast.error(result.error ?? "Failed to create user");
      } else {
        toast.success(`User ${form.email} created!`);
        setShowCreate(false);
        setForm({ email: "", password: "", full_name: "" });
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    }
    setCreating(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Manage</p>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">Users</h2>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          <Plus size={13} />
          New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-card border-2 border-border overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_80px_80px_120px_48px] gap-0 border-b-2 border-border">
          {["Name", "Email", "Workouts", "Food Logs", "Joined", ""].map((h) => (
            <div key={h} className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {h}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="px-4 py-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="px-4 py-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            No users yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex md:grid md:grid-cols-[1fr_1fr_80px_80px_120px_48px] items-center gap-3 md:gap-0 px-4 py-3 hover:bg-iron-medium/40 transition-colors"
              >
                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-foreground uppercase truncate">
                    {u.full_name || "—"}
                  </p>
                  <span className={`inline-block px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                    u.role === "admin" ? "bg-primary text-primary-foreground" : "bg-iron-medium text-muted-foreground"
                  }`}>
                    {u.role}
                  </span>
                </div>

                {/* Email */}
                <p className="hidden md:block font-mono text-xs text-muted-foreground truncate px-4">
                  {u.email}
                </p>

                {/* Workout count */}
                <p className="hidden md:block font-mono text-sm text-foreground font-bold px-4">
                  {u.workout_count}
                </p>

                {/* Food count */}
                <p className="hidden md:block font-mono text-sm text-foreground font-bold px-4">
                  {u.food_count}
                </p>

                {/* Joined */}
                <p className="hidden md:block font-mono text-[10px] text-muted-foreground px-4">
                  {format(new Date(u.created_at), "MMM dd, yyyy")}
                </p>

                {/* View button */}
                <div className="flex justify-end md:justify-center">
                  <button
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    title="View user"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-md bg-card border-2 border-primary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-border">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Admin</p>
                <h3 className="font-bold uppercase tracking-tight text-foreground">Create New User</h3>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full bg-background border-2 border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full bg-background border-2 border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary transition-colors"
                  placeholder="user@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                  className="w-full bg-background border-2 border-border px-3 py-2.5 font-mono text-sm text-foreground outline-none focus:border-primary transition-colors"
                  placeholder="Min 6 characters"
                />
              </div>

              <div className="flex border-t-2 border-border pt-4 gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-5 py-3 border-2 border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-tight flex items-center justify-between px-5 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <span>{creating ? "Creating..." : "Create User"}</span>
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <span className="font-mono">→</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
