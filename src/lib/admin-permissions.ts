export const adminRoles = ["owner", "admin", "editor", "media"] as const;

export type AdminRole = (typeof adminRoles)[number];

export type AdminCapability =
  | "manageSite"
  | "manageContent"
  | "manageMedia"
  | "manageUsers"
  | "viewMetrics";

export const roleLabels: Record<AdminRole, string> = {
  owner: "Sócio / proprietário",
  admin: "Administrador",
  editor: "Editor de conteúdo",
  media: "Social mídia",
};

export const roleDescriptions: Record<AdminRole, string> = {
  owner: "Acesso total ao painel, usuários, configurações e conteúdo.",
  admin: "Acesso total operacional, incluindo usuários e configurações.",
  editor: "Edita conteúdo da landing, marcas, categorias, FAQ e páginas.",
  media: "Gerencia biblioteca de mídia e carrossel, sem acesso sensível.",
};

const permissions: Record<AdminRole, AdminCapability[]> = {
  owner: ["manageSite", "manageContent", "manageMedia", "manageUsers", "viewMetrics"],
  admin: ["manageSite", "manageContent", "manageMedia", "manageUsers", "viewMetrics"],
  editor: ["manageContent", "manageMedia", "viewMetrics"],
  media: ["manageMedia"],
};

export function normalizeAdminRole(role?: string | null): AdminRole {
  return adminRoles.includes(role as AdminRole) ? (role as AdminRole) : "admin";
}

export function can(role: string | null | undefined, capability: AdminCapability) {
  return permissions[normalizeAdminRole(role)].includes(capability);
}

export function canAccessAdminPath(role: string | null | undefined, href: string) {
  if (href === "/admin") return true;
  if (href === "/admin/usuarios") return can(role, "manageUsers");
  if (href === "/admin/metricas") return can(role, "viewMetrics");
  if (["/admin/configuracoes", "/admin/seo"].includes(href)) return can(role, "manageSite");
  if (["/admin/midia", "/admin/carrossel"].includes(href)) return can(role, "manageMedia");
  return can(role, "manageContent");
}
