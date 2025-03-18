import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { JWT } from "next-auth/jwt";
import { AuthOptions, User as NextAuthUser, Account, Profile } from "next-auth";
import type { Session } from "next-auth";

interface UserType {
  _id: string;
  name: string;
  email: string;
  password: string;
  wallet_address: string;
  coin: number;
  role: "user" | "admin";
}

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
        const user = (await User.findOne({ email }).lean()) as UserType | null;

        if (!user || !user._id) throw new Error("User not found");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        return {
          id: String(user._id),
          name: user.name ?? "",
          email: user.email,
          wallet_address: user.wallet_address,
          coin: user.coin,
          role: user.role ?? "user",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser | (Partial<UserType> & { email?: string | null }) }) {
      if (user && user.email) {
        const userData = user as Partial<UserType>;
        token.wallet_address = userData.wallet_address;
        token.coin = userData.coin;
        token.role = userData.role ?? "user";
        token.name = userData.name ?? "";
        token.email = user.email;
      } else if (token.email) {
        await connectToDatabase();
        const updatedUser = await User.findOne({ email: token.email }).lean<UserType>();
        if (updatedUser) {
          token.wallet_address = updatedUser.wallet_address;
          token.coin = updatedUser.coin;
          token.role = updatedUser.role ?? "user";
          token.name = updatedUser.name;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.wallet_address = token.wallet_address as string;
        session.user.coin = token.coin as number;
        session.user.name = token.name as string;
        session.user.role = token.role as "user" | "admin";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
