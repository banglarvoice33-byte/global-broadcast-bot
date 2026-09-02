import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "editor";

export type SessionInfo = {
  userId: string;
  email: string | null;
  displayName: string;
  roles: StaffRole[];
} | null;

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  staleTime: 30_000,
  queryFn: async (): Promise<SessionInfo> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", data.user.id),
      supabase.from("profiles").select("display_name").eq("id", data.user.id).maybeSingle(),
    ]);

    return {
      userId: data.user.id,
      email: data.user.email ?? null,
      displayName: profile?.display_name || (data.user.email ?? "").split("@")[0] || "স্টাফ",
      roles: (roles ?? []).map((r) => r.role as StaffRole),
    };
  },
});

export function useSession() {
  return useQuery(sessionQuery);
}

export function isStaff(session: SessionInfo): boolean {
  return !!session && (session.roles.includes("admin") || session.roles.includes("editor"));
}
