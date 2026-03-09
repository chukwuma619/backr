import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCreatorByUserId } from "@/lib/db/queries";

export async function getCreatorForDashboard() {
  const user = await getCurrentUser();
  if (!user) return { user: null, creator: null };

  const { data: creator } = await getCreatorByUserId(user.id);
  return { user, creator };
}
