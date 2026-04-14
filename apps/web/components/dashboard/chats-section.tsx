"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Lock, MessageCircle, Users, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatItem = {
  chat: {
    id: string;
    type: string;
    creatorId: string;
    createdAt: Date;
    name?: string | null;
    audience?: string | null;
    imageUrl?: string | null;
  };
  creatorDisplayName: string;
  creatorUsername: string;
  creatorAvatarUrl: string | null;
  lastMessage: {
    body: string;
    createdAt: Date;
  } | null;
  isParticipant: boolean;
  canAccessMessages: boolean;
  canJoinGroup: boolean;
};

type Message = {
  id: string;
  body: string;
  senderId: string;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  createdAt: Date;
};

type PatronageItem = {
  creatorId: string;
  creatorDisplayName: string;
  creatorUsername: string;
  creatorAvatarUrl: string | null;
};

export function ChatsSection({
  initialChats,
  patronages,
  currentUserId,
  initialSelectedChatId = null,
}: {
  initialChats: ChatItem[];
  patronages: PatronageItem[];
  currentUserId: string;
  initialSelectedChatId?: string | null;
}) {
  const [chats, setChats] = useState<ChatItem[]>(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    initialSelectedChatId ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [openChatError, setOpenChatError] = useState<string | null>(null);

  const selectedChat = chats.find((c) => c.chat.id === selectedChatId);

  const threadTitle = (item: ChatItem) => {
    if (item.chat.type === "group") {
      const n = item.chat.name?.trim();
      if (n) return n;
      return `${item.creatorDisplayName} · Community`;
    }
    return item.creatorDisplayName;
  };

  const loadMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const { messages: msgs } = await res.json();
      setMessages(msgs ?? []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    const sel = chats.find((c) => c.chat.id === selectedChatId);
    if (!sel?.canAccessMessages) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }
    loadMessages(selectedChatId);
  }, [selectedChatId, chats, loadMessages]);

  const mergeOpenedChat = useCallback(
    (
      chat: ChatItem["chat"],
      creatorId: string
    ): ChatItem | null => {
      const meta = patronages.find((p) => p.creatorId === creatorId);
      if (!meta) return null;
      return {
        chat,
        creatorDisplayName: meta.creatorDisplayName,
        creatorUsername: meta.creatorUsername,
        creatorAvatarUrl: meta.creatorAvatarUrl,
        lastMessage: null,
        isParticipant: true,
        canAccessMessages: true,
        canJoinGroup: false,
      };
    },
    [patronages]
  );

  const handleOpenChat = async (
    creatorId: string,
    type: "group" | "direct"
  ) => {
    setOpenChatError(null);
    const existing = chats.find(
      (c) => c.chat.creatorId === creatorId && c.chat.type === type
    );
    if (existing && !(type === "group" && existing.canJoinGroup)) {
      setSelectedChatId(existing.chat.id);
      return;
    }

    try {
      const res = await fetch("/api/chats/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, type }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        throw new Error(
          typeof error === "string" ? error : "Failed to open chat"
        );
      }
      const { chat } = await res.json();
      const newItem = mergeOpenedChat(chat, creatorId);
      if (!newItem) return;
      setChats((prev) => {
        const i = prev.findIndex((c) => c.chat.id === chat.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = newItem;
          return next;
        }
        return [newItem, ...prev];
      });
      setSelectedChatId(chat.id);
    } catch (err) {
      console.error(err);
      setOpenChatError(
        err instanceof Error ? err.message : "Failed to open chat"
      );
    }
  };

  const handleSendMessage = async () => {
    const body = messageDraft.trim();
    if (!body || !selectedChatId || sending || !selectedChat?.canAccessMessages)
      return;

    setSending(true);
    try {
      const res = await fetch(`/api/chats/${selectedChatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const { message } = await res.json();
      setMessages((prev) => [...prev, message]);
      setMessageDraft("");
      setChats((prev) =>
        prev.map((c) =>
          c.chat.id === selectedChatId
            ? {
                ...c,
                lastMessage: {
                  body: message.body,
                  createdAt: message.createdAt,
                },
                isParticipant: true,
                canAccessMessages: true,
                canJoinGroup: false,
              }
            : c
        )
      );
    } catch {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const creatorsWithChats = new Set(
    chats.map((c) => `${c.chat.creatorId}-${c.chat.type}`)
  );
  const canStartChat = patronages.filter(
    (p) =>
      !creatorsWithChats.has(`${p.creatorId}-group`) ||
      !creatorsWithChats.has(`${p.creatorId}-direct`)
  );

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[400px] rounded-lg border bg-card">
      <div className="flex flex-1 min-h-0">
        <aside className="w-72 border-r flex flex-col shrink-0">
          <div className="p-3 border-b">
            <h2 className="font-semibold text-sm">Conversations</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {openChatError && (
                <p className="text-xs text-destructive px-2 pb-2">{openChatError}</p>
              )}
              {chats.map((item) => {
                const locked =
                  !item.canAccessMessages &&
                  !item.canJoinGroup &&
                  item.chat.type === "group";
                const subtitle = item.canJoinGroup
                  ? "Tap to join community"
                  : locked
                    ? "Upgrade to access"
                    : item.lastMessage?.body ?? "No messages yet";
                return (
                  <button
                    key={item.chat.id}
                    type="button"
                    onClick={() => {
                      setOpenChatError(null);
                      setSelectedChatId(item.chat.id);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors",
                      selectedChatId === item.chat.id
                        ? "bg-accent"
                        : "hover:bg-muted/60",
                      locked && "opacity-80"
                    )}
                  >
                    <Avatar size="sm" className="size-9 shrink-0">
                      <AvatarImage
                        src={
                          item.chat.type === "group" && item.chat.imageUrl
                            ? item.chat.imageUrl
                            : (item.creatorAvatarUrl ?? undefined)
                        }
                      />
                      <AvatarFallback>
                        {threadTitle(item).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm truncate">
                          {threadTitle(item)}
                        </span>
                        {item.chat.type === "group" && (
                          <Users className="size-3.5 text-muted-foreground shrink-0" />
                        )}
                        {locked && (
                          <Lock className="size-3.5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          {canStartChat.length > 0 && (
            <div className="p-2 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Start a conversation
              </p>
              <div className="space-y-1">
                {canStartChat.map((p) => (
                  <div
                    key={p.creatorId}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/60"
                  >
                    <Avatar size="sm" className="size-7 shrink-0">
                      <AvatarImage src={p.creatorAvatarUrl ?? undefined} />
                      <AvatarFallback>
                        {p.creatorDisplayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium truncate block">
                        {p.creatorDisplayName}
                      </span>
                      <div className="flex gap-1 mt-0.5">
                        <Button
                          size="xs"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() => handleOpenChat(p.creatorId, "group")}
                        >
                          <Users className="size-3 mr-1" />
                          Group
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          className="h-6 text-xs"
                          onClick={() => handleOpenChat(p.creatorId, "direct")}
                        >
                          <MessageCircle className="size-3 mr-1" />
                          DM
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          {selectedChat ? (
            <>
              <div className="p-3 border-b flex items-center gap-2">
                <Avatar size="sm" className="size-8 shrink-0">
                  <AvatarImage
                    src={
                      selectedChat.chat.type === "group" &&
                      selectedChat.chat.imageUrl
                        ? selectedChat.chat.imageUrl
                        : (selectedChat.creatorAvatarUrl ?? undefined)
                    }
                  />
                  <AvatarFallback>
                    {threadTitle(selectedChat).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">
                      {threadTitle(selectedChat)}
                    </span>
                    {selectedChat.chat.type === "group" && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <Users className="size-3" /> Community
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    @{selectedChat.creatorUsername}
                  </span>
                </div>
              </div>

              {selectedChat.canJoinGroup ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <Users className="size-14 text-muted-foreground/50 mb-3" />
                  <h3 className="font-semibold text-base mb-1">
                    Join this community
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    You&apos;re subscribed to {selectedChat.creatorDisplayName}.
                    Open the group chat to participate.
                  </p>
                  <Button
                    onClick={() =>
                      handleOpenChat(selectedChat.chat.creatorId, "group")
                    }
                  >
                    Join community chat
                  </Button>
                </div>
              ) : !selectedChat.canAccessMessages ? (
                selectedChat.chat.type === "group" ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Lock className="size-14 text-muted-foreground/50 mb-3" />
                    <h3 className="font-semibold text-base mb-1">
                      Membership upgrade required
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-4">
                      This community is for paid members. Upgrade your membership
                      to read and send messages.
                    </p>
                    <Button asChild>
                      <Link
                        href={`/c/${selectedChat.creatorUsername}/membership`}
                      >
                        View membership options
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
                    You don&apos;t have access to this conversation.
                  </div>
                )
              ) : (
                <>
                  <ScrollArea className="flex-1 p-4">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="size-12 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No messages yet. Say hello!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isMe = msg.senderId === currentUserId;
                          return (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex gap-2",
                                isMe && "flex-row-reverse"
                              )}
                            >
                              <Avatar size="sm" className="size-7 shrink-0">
                                <AvatarImage
                                  src={msg.senderAvatarUrl ?? undefined}
                                />
                                <AvatarFallback>
                                  {msg.senderDisplayName
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={cn(
                                  "max-w-[75%] rounded-lg px-3 py-2",
                                  isMe
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}
                              >
                                {!isMe && (
                                  <p className="text-xs font-medium mb-0.5 opacity-80">
                                    {msg.senderDisplayName}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                  {msg.body}
                                </p>
                                <p
                                  className={cn(
                                    "text-[10px] mt-1",
                                    isMe
                                      ? "opacity-80"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {format(
                                    new Date(msg.createdAt),
                                    "MMM d, h:mm a"
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="p-3 border-t">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex gap-2"
                    >
                      <Textarea
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        placeholder="Type a message..."
                        className="min-h-10 max-h-24 resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!messageDraft.trim() || sending}
                        className="shrink-0"
                      >
                        <Send className="size-4" />
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="size-16 text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-lg mb-1">Your conversations</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Engage with communities you support in group chats, or send
                direct messages to creators.
              </p>
              {chats.length === 0 && patronages.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Select a creator below to start a group chat or send a direct
                  message.
                </p>
              )}
              {patronages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Support creators on the Explore page to unlock community chats
                  and direct messaging.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
