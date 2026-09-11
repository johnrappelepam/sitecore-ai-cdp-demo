import React, { useEffect, useState } from 'react';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';

interface MicrositeEmbedProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    Microsite: Field<string>;
  };
}

interface Microsite {
  folder: string;
  url: string;
  lastmod: string;
}

const MICROSITES_HOST = process.env.NEXT_PUBLIC_MICROSITES_HOST || '';

const MicrositeEmbed = (props: MicrositeEmbedProps): React.JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const slug = props.fields?.Microsite?.value?.trim();
  const src = slug ? `${MICROSITES_HOST}/${slug}/index.html` : '';

  // ---------- EDITING MODE: show a dropdown ----------
  if (isEditing) {
    return <MicrositeEditor currentSlug={slug} />;
  }

  // ---------- FRONT-END: show the iframe ----------
  if (!slug) {
    return (
      <div className="microsite-embed microsite-embed--empty">
        <p>No microsite selected.</p>
      </div>
    );
  }

  return (
    <div className="microsite-embed">
      <iframe
        src={src}
        title={slug}
        width="100%"
        height="600"
        style={{ border: 'none' }}
        loading="lazy"
        allow="fullscreen"
      />
    </div>
  );
};

// Editing-mode UI
const MicrositeEditor = ({ currentSlug }: { currentSlug?: string }): React.JSX.Element => {
  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [selected, setSelected] = useState(currentSlug || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${MICROSITES_HOST}/microsites.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setMicrosites(data.microsites || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value);
    // See Step 4 for persistence options
  };

  return (
    <div
      className="microsite-embed microsite-embed--editing"
      style={{ padding: '1rem', border: '1px dashed #888' }}
    >
      <strong>Microsite Embed</strong>
      {loading && <p>Loading microsites…</p>}
      {error && <p style={{ color: 'red' }}>Failed to load microsites: {error}</p>}
      {!loading && !error && (
        <div style={{ marginTop: '.5rem' }}>
          <label>
            Select microsite:{' '}
            <select value={selected} onChange={handleChange}>
              <option value="">— None —</option>
              {microsites.map((m) => (
                <option key={m.folder} value={m.folder}>
                  {m.folder}
                </option>
              ))}
            </select>
          </label>
          {selected && (
            <p style={{ marginTop: '.5rem', fontSize: '.85rem', color: '#666' }}>
              Preview: {MICROSITES_HOST}/{selected}/index.html
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MicrositeEmbed;