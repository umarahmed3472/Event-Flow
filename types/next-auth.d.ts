import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      image: string | null;
      firstName: string;
      lastName: string;
      isAdmin: boolean;
      isOwner: boolean;
      phoneE164: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    image: string | null;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    phoneE164: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    image: string | null;
    isAdmin: boolean;
    firstName: string;
    lastName: string;
    phoneE164: string | null;
  }
}
