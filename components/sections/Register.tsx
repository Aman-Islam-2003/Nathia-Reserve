"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { register, site } from "@/content/site";
import { SplitReveal } from "@/components/motion/SplitReveal";

const KEY = "reserve-register-v1";
const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,}$/, "Please enter a phone number we can reach."),
  email: z.union([z.literal(""), z.string().trim().email("That email doesn't look right.")]),
});

type Data = { interest: string; timing: string; name: string; phone: string; email: string };
const empty: Data = { interest: "", timing: "", name: "", phone: "", email: "" };

/** Multi-step form. Progress is saved in this browser so a visitor can come back to it. */
export function Register() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Data>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Data, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (saved?.data) { setData({ ...empty, ...saved.data }); setStep(saved.step ?? 0); }
    } catch { /* storage unavailable: start fresh */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ step, data })); } catch { /* ignore */ }
  }, [step, data]);

  const set = (k: keyof Data, v: string) => setData((d) => ({ ...d, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Partial<Record<keyof Data, string>> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as keyof Data] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setStatus("done");
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="register" className="register section" data-chapter>
      <div className="register__copy">
        <p className="eyebrow">10 · Public release</p>
        <SplitReveal as="h2" className="h2">{register.title[0]} <em>{register.title[1]}</em></SplitReveal>
        <ol className="register__perks">
          {register.perks.map((p, i) => <li key={p}><span className="mono">{["I", "II", "III"][i]}.</span> {p}</li>)}
        </ol>
      </div>

      <div className="form">
        {status === "done" ? (
          <div className="form__done" role="status">
            <h3 className="h3">Thank you, {data.name.split(" ")[0]}.</h3>
            <p className="body">We&apos;ll call you within one working day. For anything sooner, message us on WhatsApp.</p>
            <a className="btn btn--solid" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer">Open WhatsApp</a>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="mono form__step">Step {step + 1} of 3</p>
            <div className="form__bar" aria-hidden="true"><span style={{ transform: `scaleX(${(step + 1) / 3})` }} /></div>

            {step === 0 && (
              <fieldset>
                <legend className="h3">I&apos;m interested in</legend>
                <div className="chips">
                  {register.interests.map((o) => (
                    <label key={o} className={`chip ${data.interest === o ? "is-on" : ""}`}>
                      <input type="radio" name="interest" value={o} checked={data.interest === o} onChange={() => set("interest", o)} />{o}
                    </label>
                  ))}
                </div>
                <button type="button" className="btn btn--solid" disabled={!data.interest} onClick={() => setStep(1)}>Continue</button>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="h3">When are you looking?</legend>
                <div className="chips">
                  {register.timing.map((o) => (
                    <label key={o} className={`chip ${data.timing === o ? "is-on" : ""}`}>
                      <input type="radio" name="timing" value={o} checked={data.timing === o} onChange={() => set("timing", o)} />{o}
                    </label>
                  ))}
                </div>
                <div className="form__nav">
                  <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>Back</button>
                  <button type="button" className="btn btn--solid" disabled={!data.timing} onClick={() => setStep(2)}>Continue</button>
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <legend className="h3">Where can we reach you?</legend>
                {([["name", "Full name", "text", "name"], ["phone", "Phone / WhatsApp", "tel", "tel"], ["email", "Email (optional)", "email", "email"]] as const).map(([k, label, type, ac]) => (
                  <div key={k} className="field">
                    <label htmlFor={`f-${k}`}>{label}</label>
                    <input id={`f-${k}`} type={type} autoComplete={ac} value={data[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `e-${k}` : undefined} />
                    {errors[k] && <p id={`e-${k}`} className="field__error">{errors[k]}</p>}
                  </div>
                ))}
                <div className="form__nav">
                  <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>Back</button>
                  <button type="submit" className="btn btn--solid" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Join the founders' list"}</button>
                </div>
                {status === "error" && <p className="field__error" role="alert">We couldn&apos;t send that. Check your connection and try again, or message us on WhatsApp.</p>}
              </fieldset>
            )}
            <p className="fine">Your progress saves as you go. Details are used only to contact you about this project.</p>
          </form>
        )}
      </div>
    </section>
  );
}
