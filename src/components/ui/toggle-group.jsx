import * as React from "react"
import { cn } from "@/lib/utils"

const ToggleGroupContext = React.createContext({
  value: null,
  onValueChange: () => {},
})

const ToggleGroup = React.forwardRef(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <ToggleGroupContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn(
            "bg-gray-800 rounded-lg p-1 flex",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    )
  }
)
ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)
    const isActive = context.value === value

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context.onValueChange(value)}
        className={cn(
          "px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm min-h-[44px] font-sans",
          isActive
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-300 hover:text-white",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
