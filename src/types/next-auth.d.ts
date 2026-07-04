import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    institutionalEmail?: string | null;
  }

  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      institutionalEmail?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    institutionalEmail?: string | null;
  }
}
