// src/components/identifier-text-box/IdentifierTextBox.tsx
'use client';

import { useState, FormEvent, JSX } from 'react';
import { identity } from '@sitecore-content-sdk/events'; // verify export name — see note

// Basic email shape check — good enough for a demo
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function IdentifierTextBox(): JSX.Element {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const cleanedEmail = email.trim().toLowerCase();

    if (!isValidEmail(cleanedEmail)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const identityData: any = {
        channel: 'WEB',
        language: 'EN',
        firstName: 'John',
        lastName: 'Doe',
        identifiers: [
          {
            provider: 'email',
            id: cleanedEmail,
            expiryDate: '',
          },
        ],
        email: cleanedEmail,
      };

      identity(identityData);

      setStatus('success');
      setMessage(`Identified as ${cleanedEmail} ✅`);
      setEmail('');
    } catch (err) {
      console.error('[IdentifierTextBox] identity() failed:', err);
      setStatus('error');
      setMessage('Something went wrong sending the identity event.');
    }
  };

  return (
    <section className="identifier-text-box">
      <p>
        <b>Identity Event</b>
      </p>
      <p>
        Enter your email and click "Identify Me" and it will trigger the "Identity" event in Sitecore AI. This converts you from an anonymous visitor into a known customer. Any events associated with this session are then automatically merged and applied to your known profile.
        </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="identifier-email">Email</label>
        <input
          id="identifier-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status === 'submitting'}
          required
        />
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Identifying…' : 'Identify Me'}
        </button>
      </form>

      {message && (
        <p className={status === 'error' ? 'identifier-error' : 'identifier-success'}>
          {message}
        </p>
      )}
    </section>
  );
}