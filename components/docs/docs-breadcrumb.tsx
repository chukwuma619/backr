import Link from "next/link";

type Crumb = { href: string; label: string };

export function DocsBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <p className="text-muted-foreground mb-6 text-sm">
      {items.map((item, i) => (
        <span key={item.href}>
          {i > 0 ? <span aria-hidden> · </span> : null}
          <Link href={item.href} className="underline underline-offset-4">
            {item.label}
          </Link>
        </span>
      ))}
    </p>
  );
}
