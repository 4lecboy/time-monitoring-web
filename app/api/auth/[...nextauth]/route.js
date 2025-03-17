import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/lib/db";

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials.email || !credentials.password) {
            throw new Error("Missing email or password");
          }
          
          const [users] = await db.query("SELECT * FROM users WHERE EmailAddress = ?", [credentials.email]);
          if (!users.length) {
            throw new Error("User not found");
          }
          
          const user = users[0];
          const isValid = await bcrypt.compare(credentials.password, user.Password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          return { id: user.id, email: user.EmailAddress, name: user.Name, role: user.role };
        } catch (error) {
          console.error("Authorization error:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };