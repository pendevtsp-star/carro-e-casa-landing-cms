import { Alert } from "@/components/admin/alert";

export function Toast({ saved }: { saved?: boolean }) {
  if (!saved) return null;
  return <Alert tone="success">Alterações salvas com sucesso.</Alert>;
}
