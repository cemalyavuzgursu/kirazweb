import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-cream-200 bg-white px-3 py-2 text-sm placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:border-rose-300 transition",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
