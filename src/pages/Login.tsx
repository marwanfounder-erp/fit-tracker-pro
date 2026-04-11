import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      navigate(profile.role === "admin" ? "/admin" : "/", { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error("Invalid email or password");
    }
    // redirect handled by the useEffect above once profile loads
  };

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Iron Protocol
          </p>
          <h1 className="text-3xl font-bold tracking-tighter uppercase italic text-foreground">
            Grindstone Log
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Sign in to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-card border-2 border-border px-3 py-3 font-mono text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-card border-2 border-border px-3 py-3 font-mono text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-bold text-sm uppercase py-4 tracking-tight flex justify-between px-6 items-center border-b-4 border-background hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <span>{submitting ? "Signing in..." : "Sign In"}</span>
            <span className="font-mono">→</span>
          </button>
        </form>
      </div>
    </div>
  );
}
