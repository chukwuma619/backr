import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Users, Send, } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormControl,  } from "@/components/ui/form";

export function PostSettings({ form }: { form: any }  ) {
  return (
    <aside className="w-full lg:w-80 shrink-0">
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Post settings</CardTitle>
        <CardDescription>
          Control who can see your post and when it goes live.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="minTierId"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <FormLabel>Audience</FormLabel>
              </div>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* {tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name} ({tier.amount} CKB)
                    </SelectItem>
                  ))} */}
                </SelectContent>
              </Select>
              <FormDescription className="text-xs">
                Minimum tier required to view this post
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Send className="size-4 text-muted-foreground" />
            <Label htmlFor="notify-members">Notify members</Label>
          </div>
          <Switch
            id="notify-members"
           
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Send email and push notifications when you publish
        </p>
      </CardContent>
    </Card>
  </aside>
  );
}