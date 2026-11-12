import { useState } from 'react';

/** Uses the phone's share sheet when there is one, otherwise copies the link. */
export default function ShareButton({ title, url, label = '↗ Share' }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const link = url ?? window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: link });
        return;
      }
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet closed, or clipboard blocked: nothing to do
    }
  };

  return (
    <button type="button" className="button button-ghost" onClick={share}>
      {copied ? '✓ Link copied' : label}
    </button>
  );
}
