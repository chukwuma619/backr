"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from "react";
import { format } from "date-fns";
import { MessageCircle, Users, Send, Lock, Globe, MessageCirclePlus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { uploadImageToPinata } from "@/lib/uploads/pinata-client-upload";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "../ui/dropdown-menu";

type CreatorChatItem = {
  chat: {
    id: string;
    type: string;
    creatorId: string;
    patronUserId: string | null;
    name: string | null;
    audience: string | null;
    imageUrl: string | null;
    createdAt: Date;
  };
  lastMessage: { body: string; createdAt: Date } | null;
  patronDisplayName: string | null;
  patronAvatarUrl: string | null;
};

type Message = {
  id: string;
  body: string;
  senderId: string;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  createdAt: Date;
};

type PatronItem = {
  patronUserId: string;
  patronCkbAddress: string;
  patronAvatarUrl: string | null;
  tierName: string;
  tierAmount: string;
};

type TierItem = { id: string; name: string; amount: string };

export function CreatorChatsSection({
  initialChats,
  patrons,
  tiers,
  creatorUserId,
  initialSelectedChatId = null,
}: {
  initialChats: CreatorChatItem[];
  patrons: PatronItem[];
  tiers: TierItem[];
  creatorUserId: string;
  initialSelectedChatId?: string | null;
}) {
  const [chats, setChats] = useState<CreatorChatItem[]>(initialChats);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    initialSelectedChatId ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newDMOpen, setNewDMOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupAudience, setGroupAudience] = useState<"free" | "paid">("free");
  const [groupMinTierId, setGroupMinTierId] = useState("");
  const [groupImageUrl, setGroupImageUrl] = useState("");
  const [groupImageUploading, setGroupImageUploading] = useState(false);
  const [groupImageUploadError, setGroupImageUploadError] = useState<string | null>(null);
  const groupImageFileInputRef = useRef<HTMLInputElement>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [startingDM, setStartingDM] = useState(false);
  const [selectedChatType, setSelectedChatType] = useState<"group" | "direct">("group");

  const selectedChat = chats.find((c) => c.chat.id === selectedChatId);
  const filteredChats = chats.filter((c) => c.chat.type === selectedChatType);
  const directChatPatronIds = new Set(
    chats.filter((c) => c.chat.type === "direct").map((c) => c.chat.patronUserId).filter(Boolean) as string[]
  );
  const patronsWithoutDM = patrons.filter((p) => !directChatPatronIds.has(p.patronUserId));
  const hasGroup = chats.some((c) => c.chat.type === "group");

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
    if (selectedChatId) {
      loadMessages(selectedChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChatId, loadMessages]);

  const handleSendMessage = async () => {
    const body = messageDraft.trim();
    if (!body || !selectedChatId || sending) return;
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

  const handleStartDM = async (patronUserId: string) => {
    setStartingDM(true);
    try {
      const res = await fetch("/api/creator/chats/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patronUserId }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        throw new Error(error ?? "Failed to start chat");
      }
      const { chat } = await res.json();
      const patron = patrons.find((p) => p.patronUserId === patronUserId);
      const displayName =
        patron?.patronCkbAddress != null
          ? `${patron.patronCkbAddress.slice(0, 8)}…${patron.patronCkbAddress.slice(-6)}`
          : "Supporter";
      setChats((prev) => [
        {
          chat: { ...chat, createdAt: new Date(chat.createdAt) },
          lastMessage: null,
          patronDisplayName: displayName,
          patronAvatarUrl: patron?.patronAvatarUrl ?? null,
        },
        ...prev,
      ]);
      setSelectedChatId(chat.id);
      setNewDMOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setStartingDM(false);
    }
  };

  const clearGroupChatImage = () => {
    setGroupImageUrl("");
    setGroupImageUploadError(null);
    if (groupImageFileInputRef.current) {
      groupImageFileInputRef.current.value = "";
    }
  };

  const handleGroupImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGroupImageUploadError(null);
    setGroupImageUploading(true);
    try {
      const url = await uploadImageToPinata(file);
      setGroupImageUrl(url);
    } catch (err) {
      setGroupImageUrl("");
      if (groupImageFileInputRef.current) {
        groupImageFileInputRef.current.value = "";
      }
      setGroupImageUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setGroupImageUploading(false);
    }
  };

  const handleCreateGroup = async () => {
    setCreatingGroup(true);
    try {
      const res = await fetch("/api/creator/chats/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName.trim() || undefined,
          audience: groupAudience,
          minTierId: groupAudience === "paid" ? groupMinTierId || undefined : undefined,
          imageUrl: groupImageUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          const existing = chats.find((c) => c.chat.type === "group");
          if (existing) {
            setSelectedChatId(existing.chat.id);
            setCreateGroupOpen(false);
          }
          alert("You already have a group chat. Opening it.");
          return;
        }
        throw new Error(data.error ?? "Failed to create group");
      }
      const { chat } = data;
      setChats((prev) => [
        {
          chat: { ...chat, createdAt: new Date(chat.createdAt) },
          lastMessage: null,
          patronDisplayName: null,
          patronAvatarUrl: null,
        },
        ...prev,
      ]);
      setSelectedChatId(chat.id);
      setGroupName("");
      setGroupAudience("free");
      setGroupMinTierId("");
      clearGroupChatImage();
      setCreateGroupOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  function chatTitle(item: CreatorChatItem) {
    if (item.chat.type === "direct") {
      return item.patronDisplayName ?? "Direct message";
    }
    return item.chat.name ?? "Community";
  }

  function chatSubtitle(item: CreatorChatItem) {
    return item.lastMessage?.body ?? "No messages yet";
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[400px] ">
      <div className="flex flex-1 min-h-0">
        <aside className="w-92 border-r flex flex-col shrink-0">
          <div className="p-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold text-lg">Chats</h2>
            <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-xs" variant="ghost" title="New conversation">
                    <MessageCirclePlus className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onSelect={() => setNewDMOpen(true)}
                    disabled={patronsWithoutDM.length === 0}
                  >
                    <MessageCircle className="size-4 mr-2" />
                    New Direct Message
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setCreateGroupOpen(true)}
                    disabled={hasGroup}
                  >
                    <Users className="size-4 mr-2" />
                    New Group Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Dialog open={newDMOpen} onOpenChange={setNewDMOpen}>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Message a supporter</DialogTitle>
                  </DialogHeader>
                  <div className="py-2">
                    {patronsWithoutDM.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        All supporters already have a direct chat, or you have no supporters yet.
                      </p>
                    ) : (
                      <ScrollArea className="max-h-64 pr-2">
                        <div className="space-y-1">
                          {patronsWithoutDM.map((p) => (
                            <button
                              key={p.patronUserId}
                              type="button"
                              onClick={() => handleStartDM(p.patronUserId)}
                              disabled={startingDM}
                              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-left"
                            >
                              <Avatar className="size-8 shrink-0">
                                <AvatarImage src={p.patronAvatarUrl ?? undefined} />
                                <AvatarFallback className="text-xs">
                                  {p.patronCkbAddress.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-sm truncate">
                                  {p.patronCkbAddress.slice(0, 10)}…{p.patronCkbAddress.slice(-6)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {p.tierName} · ${p.tierAmount}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog
                open={createGroupOpen}
                onOpenChange={(open) => {
                  setCreateGroupOpen(open);
                  if (!open) {
                    setGroupImageUploadError(null);
                  }
                }}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create group chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">Name</Label>
                      <Input
                        id="group-name"
                        placeholder="e.g. Community"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profile image (optional)</Label>
                      <input
                        ref={groupImageFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        aria-hidden
                        onChange={handleGroupImageFile}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={groupImageUploading}
                          onClick={() => groupImageFileInputRef.current?.click()}
                        >
                          {groupImageUploading ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : null}
                          {groupImageUrl ? "Change image" : "Upload image"}
                        </Button>
                        {groupImageUrl ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={groupImageUploading}
                            onClick={clearGroupChatImage}
                          >
                            Remove
                          </Button>
                        ) : null}
                      </div>
                      {groupImageUrl ? (
                        <Avatar className="size-14">
                          <AvatarImage src={groupImageUrl} alt="" />
                          <AvatarFallback>IMG</AvatarFallback>
                        </Avatar>
                      ) : null}
                      {groupImageUploadError ? (
                        <p className="text-xs text-destructive">{groupImageUploadError}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          JPEG, PNG, WebP, or GIF. Uploaded to IPFS via Pinata.
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <Label>Audience</Label>
                      <RadioGroup
                        value={groupAudience}
                        onValueChange={(v) => {
                          setGroupAudience(v as "free" | "paid");
                          if (v === "free") setGroupMinTierId("");
                        }}
                        className="grid gap-3"
                      >
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50">
                          <Globe className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Free</p>
                            <p className="text-xs text-muted-foreground">
                              Any supporter can join
                            </p>
                          </div>
                          <RadioGroupItem value="free" />
                        </label>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-muted/50">
                          <Lock className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">Paid</p>
                            <p className="text-xs text-muted-foreground">
                              Only selected tiers can join
                            </p>
                          </div>
                          <RadioGroupItem value="paid" />
                        </label>
                      </RadioGroup>
                    </div>
                    {groupAudience === "paid" && tiers.length > 0 && (
                      <div className="space-y-2">
                        <Label>Tier access</Label>
                        <Select
                          value={groupMinTierId || undefined}
                          onValueChange={setGroupMinTierId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select tier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All tiers</SelectItem>
                            {tiers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name} (${t.amount})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={handleCreateGroup}
                      disabled={
                        creatingGroup ||
                        groupImageUploading ||
                        !groupName.trim() ||
                        (groupAudience === "paid" && tiers.length > 0 && !groupMinTierId)
                      }
                    >
                      {creatingGroup ? "Creating…" : "Create group"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center  gap-1 p-2">
            <Button
              variant={selectedChatType === "group" ? "default" : "outline"}
              size="sm"
            
              onClick={() => setSelectedChatType("group")}
            >
              Groups
            </Button>
            <Button
              variant={selectedChatType === "direct" ? "default" : "outline"}
              size="sm"
           
              onClick={() => setSelectedChatType("direct")}
            >
              Direct messages
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredChats.map((item) => (
                <button
                  key={item.chat.id}
                  type="button"
                  onClick={() => setSelectedChatId(item.chat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors",
                    selectedChatId === item.chat.id ? "bg-accent" : "hover:bg-muted/60"
                  )}
                >
                  <Avatar size="sm" className="size-9 shrink-0">
                    {item.chat.type === "direct" && item.patronAvatarUrl ? (
                      <AvatarImage src={item.patronAvatarUrl} />
                    ) : item.chat.type === "group" && item.chat.imageUrl ? (
                      <AvatarImage src={item.chat.imageUrl} />
                    ) : null}
                    <AvatarFallback>
                      {item.chat.type === "direct"
                        ? (item.patronDisplayName ?? "?").slice(0, 2).toUpperCase()
                        : "GC"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm truncate">
                        {chatTitle(item)}
                      </span>
                      {item.chat.type === "group" && (
                        <>
                          <Users className="size-3.5 text-muted-foreground shrink-0" />
                          {item.chat.audience === "paid" && (
                            <Lock className="size-3 text-muted-foreground shrink-0" />
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chatSubtitle(item)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 rounded-lg h-full bg-card">
          {selectedChat ? (
            <>
              <div className="p-3 border-b flex items-center gap-2">
                <Avatar size="sm" className="size-8 shrink-0">
                  {selectedChat.chat.type === "direct" && selectedChat.patronAvatarUrl ? (
                    <AvatarImage src={selectedChat.patronAvatarUrl} />
                  ) : selectedChat.chat.type === "group" && selectedChat.chat.imageUrl ? (
                    <AvatarImage src={selectedChat.chat.imageUrl} />
                  ) : null}
                  <AvatarFallback>
                    {selectedChat.chat.type === "direct"
                      ? (selectedChat.patronDisplayName ?? "?").slice(0, 2).toUpperCase()
                      : "GC"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">
                      {chatTitle(selectedChat)}
                    </span>
                    {selectedChat.chat.type === "group" && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="size-3" />
                        {selectedChat.chat.audience === "paid" ? (
                          <span className="flex items-center gap-0.5">
                            <Lock className="size-3" /> Paid
                          </span>
                        ) : (
                          "Free"
                        )}
                      </span>
                    )}
                  </div>
                  {selectedChat.chat.type === "direct" && (
                    <span className="text-xs text-muted-foreground">Direct message</span>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-12 text-muted-foreground text-sm">
                    Loading messages…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageCircle className="size-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Start the conversation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isMe = msg.senderId === creatorUserId;
                      return (
                        <div
                          key={msg.id}
                          className={cn("flex gap-2", isMe && "flex-row-reverse")}
                        >
                          <Avatar size="sm" className="size-7 shrink-0">
                            <AvatarImage src={msg.senderAvatarUrl ?? undefined} />
                            <AvatarFallback>
                              {msg.senderDisplayName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "max-w-[75%] rounded-lg px-3 py-2",
                              isMe ? "bg-primary text-primary-foreground" : "bg-muted"
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
                                isMe ? "opacity-80" : "text-muted-foreground"
                              )}
                            >
                              {format(new Date(msg.createdAt), "MMM d, h:mm a")}
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
                    placeholder="Type a message…"
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
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircle className="size-16 text-muted-foreground/40 mb-4" />
              <h3 className="font-semibold text-lg mb-1">Your conversations</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Message supporters in direct chats or create a group (free or paid) for your community.
              </p>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
