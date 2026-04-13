"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!open) return null;

  const sendOTP = async () => {
    if (phone.length < 10) { toast.error("Enter a valid 10-digit number"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("OTP sent successfully!");
    setStep("otp");
  };

  const verifyOTP = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) { toast.error("Enter the complete OTP"); return; }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otpStr,
      type: "sms",
    });
    setLoading(false);
    if (error) { toast.error("Invalid OTP. Please try again."); return; }
    if (false) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({ id: user.id, full_name: name, phone: `+91${phone}` });
      }
    }
    toast.success(`Welcome${name ? ", " + name : ""}!`);
    onClose();
    window.location.reload();
  };

  const signInEmail = async () => {
    if (!email || !password) { toast.error("Enter email and password"); return; }
    setLoading(true);
    const { error } = tab === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(tab === "signin" ? "Welcome back!" : "Account created! Check your email.");
    onClose();
    window.location.reload();
  };

  const signInGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  const handleOtpChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[9000] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden border-t-4 border-gold">
        <button onClick={onClose} className="absolute right-4 top-4 text-light text-xl leading-none hover:text-dark">✕</button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-border-light">
          <div className="font-serif text-xl font-semibold tracking-[3px] text-maroon uppercase">
            Zarika<span className="text-gold font-light"> Studio</span>
          </div>
          <p className="text-xs text-light mt-1.5 tracking-wide">Sign in to continue your order</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-light">
          {(["signin", "signup"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setStep("input"); setOtp(["","","","","",""]); }}
              className={`flex-1 py-3.5 text-[11px] tracking-widest uppercase font-medium border-b-2 transition-all ${tab === t ? "text-maroon border-maroon" : "text-light border-transparent"}`}>
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="px-8 py-6">
          {/* Method toggle */}
          {step === "input" && (
            <div className="flex gap-2 mb-5">
              {(["phone", "email"] as const).map((m) => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`flex-1 py-2.5 text-xs border rounded-sm transition-all ${method === m ? "border-maroon text-maroon bg-white" : "border-border bg-cream text-mid"}`}>
                  {m === "phone" ? "📱 Phone OTP" : "✉️ Email"}
                </button>
              ))}
            </div>
          )}

          {/* Phone OTP */}
          {method === "phone" && (
            <>
              {step === "input" ? (
                <div className="space-y-4">
                  {tab === "signup" && (
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-mid mb-1.5">Full Name</label>
                      <input value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full bg-cream border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold"
                        placeholder="Priya Sharma" />
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-mid mb-1.5">Mobile Number</label>
                    <div className="flex gap-2">
                      <span className="bg-cream2 border border-border rounded-sm px-4 py-3 text-sm text-mid whitespace-nowrap">+91</span>
                      <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="flex-1 bg-cream border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold"
                        placeholder="98765 43210" type="tel" maxLength={10} />
                    </div>
                  </div>
                  <button onClick={sendOTP} disabled={loading}
                    className="w-full bg-maroon text-white py-3.5 text-[11px] tracking-widest uppercase rounded-sm hover:bg-maroon-light transition-colors disabled:opacity-60 mt-1">
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-mid">OTP sent to <strong className="text-dark">+91 {phone}</strong></p>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-mid mb-2">Enter 6-digit OTP</label>
                    <div className="flex gap-2">
                      {otp.map((digit, i) => (
                        <input key={i} id={`otp-${i}`} value={digit}
                          onChange={(e) => handleOtpChange(e.target.value.replace(/\D/g, ""), i)}
                          className="w-12 h-12 text-center bg-cream border border-border rounded-sm text-lg font-medium outline-none focus:border-gold"
                          maxLength={1} type="tel" />
                      ))}
                    </div>
                  </div>
                  <button onClick={verifyOTP} disabled={loading}
                    className="w-full bg-maroon text-white py-3.5 text-[11px] tracking-widest uppercase rounded-sm hover:bg-maroon-light transition-colors disabled:opacity-60">
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                  <p className="text-xs text-center text-light">
                    Didn't receive it?{" "}
                    <button onClick={sendOTP} className="text-gold underline">Resend OTP</button>
                  </p>
                </div>
              )}
            </>
          )}

          {/* Email */}
          {method === "email" && (
            <div className="space-y-4">
              {tab === "signup" && (
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-mid mb-1.5">Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full bg-cream border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold"
                    placeholder="Priya Sharma" />
                </div>
              )}
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-mid mb-1.5">Email Address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  className="w-full bg-cream border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-mid mb-1.5">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                  className="w-full bg-cream border border-border rounded-sm px-4 py-3 text-sm outline-none focus:border-gold"
                  placeholder="Minimum 6 characters" />
              </div>
              <button onClick={signInEmail} disabled={loading}
                className="w-full bg-maroon text-white py-3.5 text-[11px] tracking-widest uppercase rounded-sm hover:bg-maroon-light transition-colors disabled:opacity-60">
                {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"}
              </button>
            </div>
          )}

          {/* Google */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border-light"></div>
            <span className="text-xs text-light">or</span>
            <div className="flex-1 h-px bg-border-light"></div>
          </div>
          <button onClick={signInGoogle}
            className="w-full border border-border rounded-sm py-3 text-sm flex items-center justify-center gap-3 hover:border-mid transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <p className="text-[11px] text-light text-center mt-4 leading-relaxed">
            By continuing you agree to our{" "}
            <a href="/terms" className="text-gold">Terms of Service</a> &{" "}
            <a href="/privacy" className="text-gold">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
