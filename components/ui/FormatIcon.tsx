// Colour-coded tile for a content format (visual refresh v2), used wherever a format appears.
// Social = teal, Blog = navy, Email = amber; each icon colour passes 4.5:1 on its tile.
// Decorative: always shown next to the format's name, so it's hidden from screen readers.
// Usage: <FormatIcon type="social" />  or  <FormatIcon type="email" size="sm" />
import { ChatIcon, MailIcon, PageIcon } from "@/components/icons";
import type { ContentType } from "@/lib/types";

const STYLES: Record<ContentType, { tile: string; Icon: typeof ChatIcon }> = {
  social: { tile: "bg-teal-50 text-teal-700", Icon: ChatIcon },
  blog: { tile: "bg-navy-50 text-navy", Icon: PageIcon },
  email: { tile: "bg-amber-50 text-amber-700", Icon: MailIcon },
};

const SIZES = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5" },
};

export default function FormatIcon({ type, size = "md" }: { type: ContentType; size?: "sm" | "md" }) {
  const { tile, Icon } = STYLES[type];
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center ${SIZES[size].box} ${tile}`}>
      <Icon className={SIZES[size].icon} />
    </span>
  );
}
