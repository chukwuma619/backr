import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getChatsForUser, getPatronagesByUserId } from "@/lib/db/queries";
import { ChatsSection } from "@/components/dashboard/chats-section";

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const { chat: chatId } = await searchParams;

  const [{ data: chats }, { data: patronages }] = await Promise.all([
    getChatsForUser(user.id),
    getPatronagesByUserId(user.id),
  ]);

  const chatItems =
    chats?.map((c) => ({
      chat: c.chat,
      creatorDisplayName: c.creatorDisplayName,
      creatorUsername: c.creatorUsername,
      creatorAvatarUrl: c.creatorAvatarUrl,
      lastMessage: c.lastMessage
        ? {
            body: c.lastMessage.body,
            createdAt: c.lastMessage.createdAt,
          }
        : null,
    })) ?? [];

  const patronageItems =
    patronages?.map((p) => ({
      creatorId: p.creatorId,
      creatorDisplayName: p.creatorDisplayName,
      creatorUsername: p.creatorUsername,
      creatorAvatarUrl: p.creatorAvatarUrl,
    })) ?? [];

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Chats</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Engage with communities you support in group chats, or send direct
          messages to creators.
        </p>
      </div>

      <ChatsSection
        initialChats={chatItems}
        patronages={patronageItems}
        currentUserId={user.id}
        initialSelectedChatId={chatId ?? null}
      />
    </div>
  );
}
