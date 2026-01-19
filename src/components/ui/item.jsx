import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const itemVariants = cva(
  "flex items-center justify-between gap-4 rounded-lg p-3 w-full",
  {
    variants: {
      variant: {
        default: "bg-gray-900 border border-gray-700",
        outline: "border border-gray-700 bg-transparent",
        muted: "bg-gray-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Item = React.forwardRef(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(itemVariants({ variant }), className)}
      {...props}
    />
  )
)
Item.displayName = "Item"

const ItemContent = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col gap-0.5 flex-1 min-w-0", className)}
      {...props}
    />
  )
)
ItemContent.displayName = "ItemContent"

const ItemTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("text-sm font-semibold text-white uppercase tracking-wide", className)}
      {...props}
    />
  )
)
ItemTitle.displayName = "ItemTitle"

const ItemDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("text-xs text-gray-400", className)}
      {...props}
    />
  )
)
ItemDescription.displayName = "ItemDescription"

const ItemActions = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 shrink-0", className)}
      {...props}
    />
  )
)
ItemActions.displayName = "ItemActions"

export {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
}
