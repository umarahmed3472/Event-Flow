import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account', // Shows account picker
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          return null;
        }

        // Skip password check for Google users (they don't have passwords)
        if (!user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          image: user.image,
          phoneE164: user.phoneE164,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          isAdmin: user.isAdmin,
          isOwner: user.isOwner,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow credentials sign-in
      if (account?.provider === 'credentials') {
        return true;
      }

      // Handle Google sign-in
      if (account?.provider === 'google' && profile?.email) {
        try {
          // Find user by email (more reliable than by ID at this point)
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email }
          });

          // If user exists but firstName/lastName are missing, populate them
          if (existingUser && (!existingUser.firstName || !existingUser.lastName || existingUser.firstName === '' || existingUser.lastName === '')) {
            const fullName = profile.name || user.name || '';
            const nameParts = fullName.split(' ');
            
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                firstName: nameParts[0] || null,
                lastName: nameParts.slice(1).join(' ') || null,
              }
            });
          }

          return true;
        } catch (error) {
          console.error('Error updating Google user profile:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign-in - always fetch fresh data from database
      if (user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              firstName: true,
              lastName: true,
              isAdmin: true,
              isOwner: true,
              phoneE164: true,
            }
          });

          if (dbUser) {
            // Fallback: If firstName/lastName are missing but name exists, populate them
            // Note: This will work after Prisma client regeneration
            if ((!dbUser.firstName || !dbUser.lastName || dbUser.firstName === '' || dbUser.lastName === '') && dbUser.name) {
              const nameParts = dbUser.name.split(' ');
              await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  firstName: nameParts[0] || null,
                  lastName: nameParts.slice(1).join(' ') || null,
                }
              });
              
              // Update the token with the newly populated fields
              token.firstName = nameParts[0] || "";
              token.lastName = nameParts.slice(1).join(' ') || "";
            } else {
              token.firstName = dbUser.firstName || "";
              token.lastName = dbUser.lastName || "";
            }
            
            token.id = dbUser.id;
            token.email = dbUser.email;
            token.image = dbUser.image;
            token.isAdmin = dbUser.isAdmin;
            token.isOwner = dbUser.isOwner;
            token.phoneE164 = dbUser.phoneE164;
          }
        } catch (error) {
          console.error('Error fetching user data on sign-in:', error);
          // Fallback to user object data
          token.id = user.id;
          token.email = user.email;
          token.isAdmin = (user as any).isAdmin || false;
          token.isOwner = (user as any).isOwner || false;
          token.firstName = (user as any).firstName;
          token.lastName = (user as any).lastName;
        }
      }

      // For subsequent requests, fetch fresh user data if needed
      if (token.id && !user) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              name: true,
              image: true,
              firstName: true,
              lastName: true,
              isAdmin: true,
              isOwner: true,
              phoneE164: true,
            }
          });

          if (dbUser) {
            token.isAdmin = dbUser.isAdmin;
            token.isOwner = dbUser.isOwner;
            token.firstName = dbUser.firstName || "";
            token.lastName = dbUser.lastName || "";
            token.image = dbUser.image;
            token.phoneE164 = dbUser.phoneE164;
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isOwner = token.isOwner as boolean;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.image = token.image as string | null;
        session.user.phoneE164 = token.phoneE164 as string | null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('[AUTH REDIRECT] url:', url);
      console.log('[AUTH REDIRECT] baseUrl:', baseUrl);
      
      // If the URL is a relative path, prepend the base URL
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log('[AUTH REDIRECT] Case 1: Relative path - redirecting to:', redirectUrl);
        return redirectUrl;
      }
      // If the URL is on the same origin, allow it
      else if (new URL(url).origin === baseUrl) {
        console.log('[AUTH REDIRECT] Case 2: Same origin - redirecting to:', url);
        return url;
      }
      // Default to rooms page for all other cases
      const defaultUrl = `${baseUrl}/rooms`;
      console.log('[AUTH REDIRECT] Case 3: Default - redirecting to:', defaultUrl);
      return defaultUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
};
