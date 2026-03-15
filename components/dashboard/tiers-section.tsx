"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TierForm } from "./tier-form";
import { deleteTier } from "@/app/actions/tiers";
import type { Tier } from "@/lib/db/schema";

export function TiersSection({
  tiers,
  onSuccess,
}: {
  tiers: Tier[];
  onSuccess: () => void;
}) {
  const [addTierOpen, setAddTierOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [deleteTierId, setDeleteTierId] = useState<string | null>(null);

  const handleDeleteTier = async (tierId: string) => {
    await deleteTier(tierId);
    setDeleteTierId(null);
    onSuccess();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tiers</CardTitle>
          <CardDescription>Subscription tiers.</CardDescription>
        </div>
        <Dialog open={addTierOpen} onOpenChange={setAddTierOpen}>
          <DialogTrigger asChild>
            <Button>Add tier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add tier</DialogTitle>
            </DialogHeader>
            <TierForm
              onSuccess={() => {
                setAddTierOpen(false);
                onSuccess();
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {tiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tiers yet. Add one to get started.
          </p>
        ) : (
          tiers.map((tier) => (
            <Card key={tier.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{tier.name}</CardTitle>
                    {tier.description && (
                      <CardDescription>{tier.description}</CardDescription>
                    )}
                    <p className="text-sm font-medium mt-1">
                      ${tier.amount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingTierId === tier.id}
                      onOpenChange={(open) =>
                        setEditingTierId(open ? tier.id : null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit tier</DialogTitle>
                        </DialogHeader>
                        <TierForm
                          tier={{
                            id: tier.id,
                            name: tier.name,
                            description: tier.description || "",
                            amount: tier.amount,
                          }}
                          onSuccess={() => {
                            setEditingTierId(null);
                            onSuccess();
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <AlertDialog
                      open={deleteTierId === tier.id}
                      onOpenChange={(open) => !open && setDeleteTierId(null)}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTierId(tier.id)}
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete tier?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the tier. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTier(tier.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
