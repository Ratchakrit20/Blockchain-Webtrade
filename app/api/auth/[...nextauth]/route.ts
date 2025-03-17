import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { JWT } from "next-auth/jwt"; 
import { AuthOptions } from "next-auth"; 
import type { Session } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email", placeholder: "email@example.com" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials) throw new Error("Missing credentials");

          const { email, password } = credentials;
          if (!email || !password) throw new Error("Missing email or password");

          await connectToDatabase();
          const user = await User.findOne({ email }).lean() as { 
              _id: string, 
              email: string, 
              password: string, 
              wallet_address: string, 
              coin: number 
          } | null;

          if (!user || !user._id) throw new Error("User not found");

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) throw new Error("Invalid credentials");

          return { id: String(user._id), email: user.email, wallet_address: user.wallet_address, coin: user.coin };
        },
      }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
      async jwt({ token, user }: { token: JWT; user?: { wallet_address: string; coin: number } }) {  
        if (user) {
          token.wallet_address = user.wallet_address;
          token.coin = user.coin;
        }
        return token;
      },
      async session({ session, token }: { session: Session; token: JWT }) {
        if (session.user) {
          session.user.wallet_address = token.wallet_address as string;
          session.user.coin = token.coin as number;
        }
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
