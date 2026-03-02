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
import { PerkForm } from "./perk-form";
import { deleteTier } from "@/app/actions/tiers";
import { deletePerk } from "@/app/actions/perks";
import type { Tier, Perk, Creator } from "@/lib/db/schema";

export function TiersSection({
  creator,
  tiersAndPerks,
  onSuccess,
}: {
  creator: Creator;
  tiersAndPerks: (Tier & { perks: Perk[] })[];
  onSuccess: () => void;
}) {
  const [addTierOpen, setAddTierOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [addPerkTierId, setAddPerkTierId] = useState<string | null>(null);
  const [editingPerkId, setEditingPerkId] = useState<string | null>(null);
  const [deleteTierId, setDeleteTierId] = useState<string | null>(null);
  const [deletePerkId, setDeletePerkId] = useState<string | null>(null);

  const handleDeleteTier = async (tierId: string) => {
    await deleteTier(tierId);
    setDeleteTierId(null);
    onSuccess();
  };

  const handleDeletePerk = async (perkId: string) => {
    await deletePerk(perkId);
    setDeletePerkId(null);
    onSuccess();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tiers</CardTitle>
          <CardDescription>Subscription tiers and perks.</CardDescription>
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
        {tiersAndPerks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tiers yet. Add one to get started.</p>
        ) : (
          tiersAndPerks.map((tier) => (
            <Card key={tier.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{tier.name}</CardTitle>
                    {tier.description && (
                      <CardDescription>{tier.description}</CardDescription>
                    )}
                    <p className="text-sm font-medium mt-1">
                      {tier.priceAmount} {tier.priceCurrency} / {tier.billingInterval}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingTierId === tier.id}
                      onOpenChange={(open) => setEditingTierId(open ? tier.id : null)}
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
                            priceAmount: tier.priceAmount,
                            priceCurrency: tier.priceCurrency,
                            billingInterval: tier.billingInterval,
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
                            This will remove the tier and all its perks. This cannot be undone.
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
              <CardContent className="pt-0">
                <p className="text-sm font-medium mb-2">Perks</p>
                {tier.perks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No perks.</p>
                ) : (
                  <ul className="space-y-1 mb-3">
                    {tier.perks.map((perk) => (
                      <li key={perk.id} className="flex items-center justify-between text-sm">
                        <span>{perk.description}</span>
                        <div className="flex gap-1">
                          <Dialog
                            open={editingPerkId === perk.id}
                            onOpenChange={(open) => setEditingPerkId(open ? perk.id : null)}
                          >
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit perk</DialogTitle>
                              </DialogHeader>
                              <PerkForm
                                perk={{
                                  id: perk.id,
                                  description: perk.description,
                                  type: perk.type ?? "",
                                }}
                                onSuccess={() => {
                                  setEditingPerkId(null);
                                  onSuccess();
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                          <AlertDialog
                            open={deletePerkId === perk.id}
                            onOpenChange={(open) => !open && setDeletePerkId(null)}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => setDeletePerkId(perk.id)}
                            >
                              Delete
                            </Button>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete perk?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePerk(perk.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <Dialog
                  open={addPerkTierId === tier.id}
                  onOpenChange={(open) => setAddPerkTierId(open ? tier.id : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Add perk
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add perk</DialogTitle>
                    </DialogHeader>
                    <PerkForm
                      tierId={tier.id}
                      onSuccess={() => {
                        setAddPerkTierId(null);
                        onSuccess();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
