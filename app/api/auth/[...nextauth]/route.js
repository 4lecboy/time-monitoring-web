import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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
          console.log("🔍 Login Attempt:", credentials);
      
          if (!credentials.email || !credentials.password) {
            console.log("❌ Missing email or password");
            throw new Error("Missing email or password");
          }
      
          // Fetch user from database
          const [users] = await db.query("SELECT * FROM users WHERE email = ?", [credentials.email]);
          
          console.log("🔍 Database Query Result:", users); // Debugging log
      
          if (!users || users.length === 0) {
            console.log("❌ User not found in database:", credentials.email);
            throw new Error("User not found");
          }
      
          const user = users[0];
          console.log("✅ User found:", user);
      
          // Check if password matches
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("🔍 Password match result:", isValid);
      
          if (!isValid) {
            console.log("❌ Invalid password for user:", credentials.email);
            throw new Error("Invalid password");
          }
      
          console.log("✅ Authentication successful for:", user.email);
      
          return { 
            id: user.id, 
            ashima_id: user.ashima_id, 
            email: user.email, 
            full_name: user.full_name,  // Keep full_name since it exists
            role: user.role,
            campaign: user.campaign,
            status: user.status
          };
        } catch (error) {
          console.error("❌ Authorization error:", error.message);
          throw new Error("Authentication failed");
        }
      }   
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.ashima_id = user.ashima_id;
        token.role = user.role;
        token.name = user.full_name;
        token.campaign = user.campaign;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.id,
          ashima_id: token.ashima_id, // Add Employee ID to session
          role: token.role,
          email: session.user.email,
          name: token.name || session.user.name,
          campaign: token.campaign,
          status: token.status,
        },
      };
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
