"use client";
import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// shadcn/ui Tabs (Radix), styled as a pill segmented control.
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-2", className)} {...props}/>;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-muted/80 p-1 backdrop-blur [scrollbar-width:none]", className)} {...props}/>;
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap text-muted-foreground outline-none transition-all duration-200 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_3px_rgb(16_27_61/0.1),0_0_0_1px_var(--border)]", className)} {...props}/>;
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("outline-none", className)} {...props}/>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
