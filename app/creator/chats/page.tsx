import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import {
  getChatsForCreator,
  getPatronsByCreatorId,
  getTiersByCreatorId,
} from "@/lib/db/queries";
import { CreatorChatsSection } from "@/components/creator/creator-chats-section";

export default async function CreatorChatsPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return null;

  const { chat: chatId } = await searchParams;

  const [
    { data: chats },
    { data: patrons },
    { data: tiers },
  ] = await Promise.all([
    getChatsForCreator(creator.id),
    getPatronsByCreatorId(creator.id),
    getTiersByCreatorId(creator.id),
  ]);

  const chatItems =
    chats?.map((c) => ({
      chat: {
        ...c.chat,
        createdAt: c.chat.createdAt,
      },
      lastMessage: c.lastMessage
        ? {
            body: c.lastMessage.body,
            createdAt: c.lastMessage.createdAt,
          }
        : null,
      patronDisplayName: c.patronDisplayName,
      patronAvatarUrl: c.patronAvatarUrl,
    })) ?? [];

  const patronItems =
    patrons?.map((p) => ({
      patronUserId: p.patronUserId,
      patronCkbAddress: p.patronCkbAddress,
      patronAvatarUrl: p.patronAvatarUrl,
      tierName: p.tierName,
      tierAmount: p.tierAmount,
    })) ?? [];

  const tierItems =
    tiers?.map((t) => ({ id: t.id, name: t.name, amount: t.amount })) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Chats</h1>
        <p className="text-muted-foreground">
          Manage conversations with your supporters. Message them directly or
          create a free or paid group chat.
        </p>
      </div>
      <CreatorChatsSection
        initialChats={chatItems}
        patrons={patronItems}
        tiers={tierItems}
        creatorUserId={creator.userId}
        initialSelectedChatId={chatId ?? null}
      />
    </div>
  );
}
