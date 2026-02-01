import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: 
          "text-foreground border-border",
        // Fresh catch badge - teal
        fresh:
          "border-transparent bg-accent text-accent-foreground",
        // Offer/discount badge - coral
        offer:
          "border-transparent bg-secondary text-white",
        // In stock badge
        inStock:
          "border-transparent bg-emerald-500 text-white",
        // Out of stock
        outOfStock:
          "border-transparent bg-muted text-muted-foreground",
        // Premium badge
        premium:
          "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        // Category badge
        category:
          "border-primary/20 bg-primary/10 text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
