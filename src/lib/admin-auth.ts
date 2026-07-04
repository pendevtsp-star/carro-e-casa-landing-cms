import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { can, type AdminCapability } from "@/lib/admin-permissions";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  return session;
}

export async function getCurrentAdminUser() {
  const session = await requireAdmin();
  const email = session.user?.email;

  if (!email) {
    redirect("/admin/login");
  }

  const user = await prisma.adminUser.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      institutionalEmail: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    redirect("/admin/login");
  }

  return user;
}

export async function requireCapability(capability: AdminCapability) {
  const user = await getCurrentAdminUser();

  if (!can(user.role, capability)) {
    redirect("/admin?denied=1");
  }

  return user;
}
