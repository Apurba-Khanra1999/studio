"use client";

import { useRouter } from 'next/navigation';
import React from 'react';

export default function LoginPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/board');
  }, [router]);

  return null;
}
