import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const consentKey = "whisker-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(consentKey) === null);
  }, []);

  const choose = (choice: "accepted" | "rejected") => {
    window.localStorage.setItem(consentKey, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="cookie-banner" aria-label="Cookie consent">
      <p>
        We use essential cookies to make this site work. With your consent, we also use optional cookies to understand how the site is used. You can accept optional cookies or reject non-essential cookies. See our <a href="/cookies-policy" className="cookie-policy-link">Cookies Policy</a>.
      </p>
      <div className="cookie-actions">
        <Button type="button" variant="outline" onClick={() => choose("rejected")}>Reject non-essential</Button>
        <Button type="button" onClick={() => choose("accepted")}>Accept optional cookies</Button>
      </div>
    </aside>
  );
}