"use client";

import { useState } from "react";
import { interests } from "@/content/site";

/** Simple enquiry form. It only shows a thank-you message; connect it to email/CRM later. */
export function Register() {
  const [sent, setSent] = useState(false);

  return (
    <section id="register" className="section register">
      <p className="label">04 · Register</p>
      <h2 className="h2">Register <em>your interest.</em></h2>

      {sent ? (
        <p className="lede" role="status">Thank you. We&apos;ll be in touch soon.</p>
      ) : (
        <form className="form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <label>Full name<input name="name" required autoComplete="name" /></label>
          <label>Phone<input name="phone" type="tel" required autoComplete="tel" /></label>
          <label>Interested in
            <select name="interest" defaultValue={interests[0]}>
              {interests.map((i) => <option key={i}>{i}</option>)}
            </select>
          </label>
          <button type="submit" className="btn btn--solid" data-cursor="Send">Send</button>
        </form>
      )}
    </section>
  );
}
