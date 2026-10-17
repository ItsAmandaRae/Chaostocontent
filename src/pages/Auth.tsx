import { useState, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import RecoveryForm from "@/components/RecoveryForm";
import { recoverySession } from "@/lib/recoverySession";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type AuthView = "login" | "signup" | "forgot" | "reset";

const TILE_SIZE = 64;

const FieldError = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
    className="relative mt-2"
  >
    <div className="bg-white border border-black pl-2 pr-4 py-2 rounded-full shadow-[3px_3px_0px_0px_black] flex items-center gap-2">
      <div className="w-5 h-5 bg-highlight rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">!</span>
      </div>
      <span className="font-body text-black text-sm">{message}</span>
    </div>
  </motion.div>
);

export default function Auth() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const recovery = useSyncExternalStore(recoverySession.subscribe, recoverySession.getSnapshot);
  const resetRoute = location.pathname === "/reset-password" || searchParams.get("mode") === "reset";
  const recoveryActive = resetRoute || ["checking", "ready", "invalid", "complete"].includes(recovery.status);
  const requestedMode = searchParams.get("mode");
  const initialView: AuthView = requestedMode === "forgot" || requestedMode === "signup" ? requestedMode : "login";
  
  const [normalView, setView] = useState<AuthView>(initialView);
  const view: AuthView = recoveryActive ? "reset" : normalView;
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  // Update view when URL params change
  useEffect(() => {
    const mode = searchParams.get("mode") as AuthView;
    if (mode && (mode === "login" || mode === "signup" || mode === "forgot")) {
      setView(mode);
      setErrors({});
    }
  }, [searchParams]);

  useEffect(() => {
    const canRedirect = () => !resetRoute && searchParams.get("mode") !== "forgot" &&
      !["forgot", "reset"].includes(normalView) && recoverySession.getSnapshot().status === "none";
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "PASSWORD_RECOVERY" && session?.user && canRedirect()) navigate("/dashboard");
    });
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (active && !error && data.user && canRedirect()) navigate("/dashboard");
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [navigate, normalView, resetRoute, searchParams]);

  const clearErrors = () => setErrors({});

  const handleViewChange = (newView: AuthView) => {
    clearErrors();
    setEmailSent(false);
    setView(newView);
    navigate(`/auth?mode=${newView}`, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (view === "reset") return;
    
    if (view === "forgot") {
      const validation = emailSchema.safeParse({ email });
      if (!validation.success) {
        const fieldErrors: { email?: string } = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setEmailSent(true);
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
      return;
    }

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const redirectUrl = window.location.origin;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });
        if (error) throw error;
        setEmailSent(true);
      }
    } catch (error: any) {
      if (error.message === "User already registered") {
        toast.error("This email is already registered. Please sign in instead.");
      } else if (error.message === "Invalid login credentials") {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case "login": return "Welcome Back";
      case "signup": return "Create Account";
      case "forgot": return "Reset Password";
      case "reset": return "New Password";
    }
  };

  const getDescription = () => {
    switch (view) {
      case "login": return "Sign in to continue creating content";
      case "signup": return "Turn your chaos into content";
      case "forgot": return "Enter your email to receive a reset link";
      case "reset": return "Choose a new password for your account";
    }
  };

  const getButtonText = () => {
    if (loading) return "Loading...";
    switch (view) {
      case "login": return "Sign in";
      case "signup": return "Create account";
      case "forgot": return "Send reset link";
      case "reset": return "Save new password";
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left grid columns - black background with white rounded tiles */}
        <div className="absolute left-0 top-0 h-full hidden lg:block bg-black" style={{ width: TILE_SIZE * 2 - 1 }}>
          <div className="flex">
            <div className="flex flex-col">
              {[...Array(32)].map((_, row) => {
                let roundedClass = "";
                // Outer left edge only
                if (row === 2) roundedClass = "rounded-bl-[32px]";
                else if (row === 3) roundedClass = "rounded-tl-[32px]";
                else if (row === 10) roundedClass = "rounded-bl-[32px]";
                else if (row === 11) roundedClass = "rounded-tl-[32px]";
                else if (row === 14) roundedClass = "rounded-bl-[32px]";
                else if (row === 15) roundedClass = "rounded-tl-[32px]";

                // 4-tile intersection (inner corners between the 2 columns)
                if (row === 5) roundedClass = `${roundedClass} rounded-br-[32px]`.trim();
                if (row === 6) roundedClass = `${roundedClass} rounded-tr-[32px]`.trim();

                return (
                  <div
                    key={`left-col1-${row}`}
                    className={`w-16 h-16 bg-white border border-black ${roundedClass}`}
                    style={{ marginTop: row > 0 ? "-1px" : 0 }}
                  />
                );
              })}
            </div>
            <div className="flex flex-col" style={{ marginLeft: "-1px" }}>
              {[...Array(32)].map((_, row) => {
                let roundedClass = "";

                // 4-tile intersection (inner corners between the 2 columns)
                if (row === 5) roundedClass = "rounded-bl-[32px]";
                else if (row === 6) roundedClass = "rounded-tl-[32px]";

                return (
                  <div
                    key={`left-col2-${row}`}
                    className={`w-16 h-16 bg-white border border-black ${roundedClass}`}
                    style={{ marginTop: row > 0 ? "-1px" : 0 }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right grid columns - black background with white rounded tiles */}
        <div className="absolute right-0 top-0 h-full hidden lg:block bg-black" style={{ width: TILE_SIZE * 2 - 1 }}>
          <div className="flex">
            <div className="flex flex-col">
              {[...Array(32)].map((_, row) => {
                let roundedClass = "";

                // 4-tile intersection (inner corners between the 2 columns)
                if (row === 8) roundedClass = "rounded-br-[32px]";
                else if (row === 9) roundedClass = "rounded-tr-[32px]";

                return (
                  <div
                    key={`right-col1-${row}`}
                    className={`w-16 h-16 bg-white border border-black ${roundedClass}`}
                    style={{ marginTop: row > 0 ? "-1px" : 0 }}
                  />
                );
              })}
            </div>
            <div className="flex flex-col" style={{ marginLeft: "-1px" }}>
              {[...Array(32)].map((_, row) => {
                let roundedClass = "";
                // Outer right edge only
                if (row === 1) roundedClass = "rounded-br-[32px]";
                else if (row === 2) roundedClass = "rounded-tr-[32px]";
                else if (row === 5) roundedClass = "rounded-br-[32px]";
                else if (row === 6) roundedClass = "rounded-tr-[32px]";
                else if (row === 12) roundedClass = "rounded-br-[32px]";
                else if (row === 13) roundedClass = "rounded-tr-[32px]";

                // 4-tile intersection (inner corners between the 2 columns)
                if (row === 8) roundedClass = `${roundedClass} rounded-bl-[32px]`.trim();
                if (row === 9) roundedClass = `${roundedClass} rounded-tl-[32px]`.trim();

                return (
                  <div
                    key={`right-col2-${row}`}
                    className={`w-16 h-16 bg-white border border-black ${roundedClass}`}
                    style={{ marginTop: row > 0 ? "-1px" : 0 }}
                  />
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Logo centered above form */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link to="/" className="block hover:opacity-70 transition-opacity">
            <Logo />
          </Link>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="relative bg-white border border-black p-6 sm:p-8 lg:p-12">
            {/* Title */}
            <motion.h1
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="font-display font-black text-3xl sm:text-4xl leading-tight tracking-[-1.2px] text-black text-center mb-4 sm:mb-6 uppercase"
            >
              {getTitle()}
            </motion.h1>

            <p className="text-center text-black font-body mb-6 sm:mb-8 lg:mb-10">
              {getDescription()}
            </p>

            {/* Form */}
            {view === "reset" ? <RecoveryForm /> : emailSent ? (
              <div className="space-y-4 text-center" role="status">
                <p>{view === "signup" ? "Check your email to confirm your account before signing in." : "If an account matches that email, you’ll receive a password reset link. Check your inbox and spam folder."}</p>
                <Button variant="outline" onClick={() => { setEmailSent(false); }}>Use another email</Button>
              </div>
            ) : <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 sm:gap-5 lg:gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="font-body text-black text-sm lg:text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  placeholder="you@example.com"
                  className={`h-12 lg:h-16 bg-white border rounded-full font-body text-black text-base lg:text-lg placeholder:text-black/40 px-5 lg:px-6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.email ? "border-highlight" : "border-black focus-visible:border-highlight"
                  }`}
                />
                <AnimatePresence>
                  {errors.email && <FieldError message={errors.email} />}
                </AnimatePresence>
              </div>

              {view !== "forgot" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password" className="font-body text-black text-sm lg:text-base">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={view === "signup" ? "new-password" : "current-password"}
                    aria-invalid={Boolean(errors.password)}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="••••••••"
                    className={`h-12 lg:h-16 bg-white border rounded-full font-body text-black text-base lg:text-lg placeholder:text-black/40 px-5 lg:px-6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      errors.password ? "border-highlight" : "border-black focus-visible:border-highlight"
                    }`}
                  />
                  <AnimatePresence>
                    {errors.password && <FieldError message={errors.password} />}
                  </AnimatePresence>
                </div>
              )}

              {view === "login" && (
                <Button
                  type="button" variant="link"
                  onClick={() => handleViewChange("forgot")}
                  className="text-foreground underline hover:no-underline font-body text-left -mt-2"
                >
                  Forgot password?
                </Button>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="mt-4 bg-highlight border border-black h-12 lg:h-16 px-8 font-body font-medium text-base lg:text-lg text-highlight-foreground rounded-full shadow-[4px_6px_0px_0px_black] hover:shadow-[2px_4px_0px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-[1px_1px_0px_0px_black] active:translate-x-[5px] active:translate-y-[5px] transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {getButtonText()}
              </Button>
            </form>}

            {/* Footer text */}
            <p className="mt-6 text-center text-black font-body">
              {view === "login" && (
                <>
                  Don't have an account?{" "}
                  <Button
                    type="button" variant="link"
                    onClick={() => handleViewChange("signup")}
                    className="text-foreground underline hover:no-underline"
                  >
                    Sign up
                  </Button>
                </>
              )}
              {view === "signup" && (
                <>
                  Already have an account?{" "}
                  <Button
                    type="button" variant="link"
                    onClick={() => handleViewChange("login")}
                    className="text-foreground underline hover:no-underline"
                  >
                    Sign in
                  </Button>
                </>
              )}
              {view === "forgot" && (
                <>
                  Remember your password?{" "}
                  <Button
                    type="button" variant="link"
                    onClick={() => handleViewChange("login")}
                    className="text-foreground underline hover:no-underline"
                  >
                    Sign in
                  </Button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
