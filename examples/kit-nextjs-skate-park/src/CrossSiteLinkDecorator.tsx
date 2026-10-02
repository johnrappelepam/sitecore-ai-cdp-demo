'use client';
import { useEffect } from 'react';
import { onSdkReady } from './Bootstrap';

const TARGET_ORIGIN = 'https://secondary-cdp-site.vercel.app';
const COOKIE_NAME = 'sc_id';
const PARAM = 'sc_id';
const SELECTOR = `a[href^="${TARGET_ORIGIN}"]`;

function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.substring(name.length + 1)) : null;
}

function decorate(a: HTMLAnchorElement) {
  const id = readCookie(COOKIE_NAME);
  if (!id) return;
  const url = new URL(a.href);
  url.searchParams.set(PARAM, `${id}.${Math.floor(Date.now() / 1000)}`);
  a.href = url.toString();
}

function scan() {
  const links = document.querySelectorAll<HTMLAnchorElement>(SELECTOR);
  links.forEach(decorate);
  if (links.length) console.debug(`[CrossSite] decorated ${links.length} link(s)`);
}

export default function CrossSiteLinkDecorator() {
  useEffect(() => {
    
    scan();

    onSdkReady(scan);

    let pending = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(scan);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const onClick = (e: Event) => {
      const a = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLAnchorElement | null;
      if (a) decorate(a);
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick, true);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(pending);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('auxclick', onClick, true);
    };
  }, []);

  return null;
}