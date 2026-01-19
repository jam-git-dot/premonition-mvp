import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(
  ({ className, children, value, onValueChange, ...props }, ref) => {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          "bg-transparent text-white font-semibold cursor-pointer outline-none border-2 border-white/30 hover:border-white/60 rounded px-3 py-2 transition-colors min-h-[44px]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

const SelectOption = React.forwardRef(
  ({ className, ...props }, ref) => (
    <option
      ref={ref}
      className={cn("bg-gray-800", className)}
      {...props}
    />
  )
)
SelectOption.displayName = "SelectOption"

export { Select, SelectOption }
