'use client';

import { usePathname } from 'next/navigation';
import GlobalChat from './GlobalChat';

export default function GlobalChatHost() {
  const pathname = usePathname();

  if (pathname === '/asistan') {
    return null;
  }

  return <GlobalChat />;
}
