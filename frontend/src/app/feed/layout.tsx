export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh w-full overflow-hidden bg-videoInk-b">{children}</div>
  );
}
