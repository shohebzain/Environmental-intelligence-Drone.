import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, ArrowRight, Activity } from "lucide-react";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("officer@city.gov");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6 font-sans select-none">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-emerald-100"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 2 6.5 5 8" />
              <path d="M12 18s-4-3.5-4-6.5a4 4 0 1 1 8 0c0 3-4 6.5-4 6.5z" />
              <circle cx="12" cy="11.5" r="1.5" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-100">EID Platform Sign In</h2>
          <p className="text-xs text-slate-400">
            Environmental Intelligence Drone Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Email / Account
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-200 focus:border-emerald-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-slate-200 focus:border-emerald-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : "Enter Platform"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
          <div className="font-semibold text-slate-300">Quick Demo Roles:</div>
          <button
            type="button"
            onClick={() => { setEmail("officer@city.gov"); setPassword("demo"); }}
            className="w-full text-left p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-700 flex justify-between text-xs transition-colors"
          >
            <span>Municipal Environmental Officer</span>
            <span className="text-emerald-400 font-medium">Demo</span>
          </button>
          <button
            type="button"
            onClick={() => { setEmail("researcher@university.edu"); setPassword("demo"); }}
            className="w-full text-left p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-700 flex justify-between text-xs transition-colors"
          >
            <span>Environmental Analyst</span>
            <span className="text-emerald-400 font-medium">Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
