"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type BecomeACreatorFormProps = {
  isCreator?: boolean;
};

export function BecomeACreatorForm({ isCreator }: BecomeACreatorFormProps) {
  const router = useRouter();

  if (isCreator) {
    return null;
  }

  return (
    <Card className="gap-2 py-4 shadow-none mt-auto">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Become a creator</CardTitle>
        <CardDescription>
          Build a membership for your fans and get paid to create on your own
          terms
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none"
              size="sm"
            >
              Get started
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Become a creator?</AlertDialogTitle>
              <AlertDialogDescription>
                You&apos;ll be redirected to set up your creator profile. You can
                create tiers, share posts, and build your membership. Continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push("/create")}
              >
                Yes, continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
