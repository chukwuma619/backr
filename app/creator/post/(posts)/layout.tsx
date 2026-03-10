import { Tabs,  TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function CreatorPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Post Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your posts.
          </p>
        </div>
      </div>

      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published" asChild>
            <Link href="/creator/post">Published </Link>
          </TabsTrigger>
          <TabsTrigger value="drafts" asChild>
            <Link href="/creator/post/draft">Drafts </Link>
          </TabsTrigger>
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
}
