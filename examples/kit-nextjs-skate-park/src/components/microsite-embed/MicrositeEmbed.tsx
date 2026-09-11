'use client';

import React, { JSX, useEffect, useState } from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { getFieldValue } from 'lib/component-props';
import { MicrositeEmbedProps } from './microsite-embed.props';

const MICROSITES_HOST = process.env.NEXT_PUBLIC_MICROSITES_HOST || '';

interface Microsite {
  folder: string;
  url: string;
  lastmod: string;
}

const MicrositeEmbedContent = (props: MicrositeEmbedProps): JSX.Element => {
  const { fields, params } = props;
  const { styles, RenderingIdentifier: id } = params;

  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  const fieldValue = getFieldValue(fields?.Microsite);
  const savedSlug = fieldValue?.value?.trim();
  const src = savedSlug ? `${MICROSITES_HOST}/${savedSlug}/index.html` : '';

  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    fetch(`${MICROSITES_HOST}/microsites.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          const list: Microsite[] = data.microsites || [];
          // Ensure alphabetical order by folder
          list.sort((a, b) => a.folder.localeCompare(b.folder));
          setMicrosites(list);
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
  }, [isEditing]);

  const Wrapper = ({ children }: { children: JSX.Element }): JSX.Element => (
    <section className={`component microsite-embed ${styles}`} id={id}>
      <div className="component-content">{children}</div>
    </section>
  );

  if (!fields) {
    return (
      <Wrapper>
        <span className="is-empty-hint">Microsite Embed</span>
      </Wrapper>
    );
  }

  // ---------- EDITING MODE ----------
  if (isEditing) {
    return (
      <Wrapper>
        <div className="field-microsite-selector">
          <p className="microsite-embed__heading">
            <strong>Microsite Embed — Author Setup</strong>
          </p>

          {/* Saved value / commit field */}
          <div className="microsite-embed__savebox">
            <p className="microsite-embed__save-instructions">
              Set the value below to the folder name of the microsite you want
              to embed (double-click a name in the table to select, then copy &amp; paste).
            </p>
            <div className="microsite-embed__field">
              <span className="microsite-embed__field-label">Saved value:</span>{' '}
              <Text field={fieldValue} editable />
            </div>
          </div>

          {/* Reference table of available microsites */}
          <div className="microsite-embed__reference">
            <p className="microsite-embed__reference-title">Available microsites</p>
            {loading && <p>Loading microsites…</p>}
            {error && (
              <p className="microsite-embed__error">Failed to load microsites: {error}</p>
            )}
            {!loading && !error && (
              <div className="microsite-embed__table-scroll">
                <table className="microsite-embed__table">
                  <thead>
                    <tr>
                      <th>Folder (value to paste)</th>
                      <th>Last updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {microsites.length === 0 && (
                      <tr>
                        <td colSpan={2}>No microsites found.</td>
                      </tr>
                    )}
                    {microsites.map((m) => (
                      <tr
                        key={m.folder}
                        className={m.folder === savedSlug ? 'is-current' : undefined}
                      >
                        <td>
                          <code className="microsite-embed__folder">{m.folder}</code>
                        </td>
                        <td>{m.lastmod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Live preview of the CURRENTLY SAVED microsite */}
          {src && (
            <div className="microsite-embed__preview-frame">
              <p className="microsite-embed__preview-label">Preview: {src}</p>
              <iframe
                src={src}
                title={`preview-${savedSlug}`}
                width="100%"
                height="400"
                className="microsite-embed__iframe"
                loading="lazy"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          )}
        </div>
      </Wrapper>
    );
  }

  // ---------- FRONT-END ----------
  if (!savedSlug) {
    return (
      <Wrapper>
        <span className="is-empty-hint">No microsite selected</span>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="field-microsite-frame">
        <iframe
          src={src}
          title={savedSlug}
          width="100%"
          height="600"
          className="microsite-embed__iframe"
          loading="lazy"
          allow="fullscreen"
        />
      </div>
    </Wrapper>
  );
};

export const Default = (props: MicrositeEmbedProps): JSX.Element => {
  return <MicrositeEmbedContent {...props} />;
};