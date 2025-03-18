import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    wallet_address: string;
    coin: number;
    role: "user" | "admin";
    name: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    wallet_address: string;
    coin: number;
    role: "user" | "admin";
    name: string;
    email: string;
  }
}
