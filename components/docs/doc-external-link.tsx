export function DocExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80"
    >
      {children}
    </a>
  );
}
