import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link";
export function BecomeACreatorForm() {
  return (
    <Card className="gap-2 py-4 shadow-none mt-auto">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Become a creator</CardTitle>
        <CardDescription>
        Build a membership for your fans and get paid to create on your own terms
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
          <Link href="/create" className="grid gap-2.5">
            <Button
              className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none"
              size="sm"
            >
              Get started
            </Button>
          </Link>
      </CardContent>
    </Card>
  )
}
