"use client"; // ✅ บังคับให้เป็น Client Component

import { SessionProvider as Provider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider>{children}</Provider>;
}
