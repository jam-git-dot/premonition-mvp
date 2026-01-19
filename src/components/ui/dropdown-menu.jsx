import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
})

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = React.useState(false)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return

    const handleClick = (e) => {
      // Check if click is outside the dropdown
      if (!e.target.closest('[data-dropdown-menu]')) {
        setOpen(false)
      }
    }

    // Close on escape
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative" data-dropdown-menu>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef(
  ({ className, asChild, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(DropdownMenuContext)

    const handleClick = (e) => {
      e.stopPropagation()
      setOpen(!open)
    }

    // If asChild, clone the child and add click handler
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref,
        onClick: (e) => {
          handleClick(e)
          children.props.onClick?.(e)
        },
        'aria-expanded': open,
        'aria-haspopup': true,
        ...props,
      })
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-haspopup={true}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
          "bg-gray-800 text-white hover:bg-gray-700 border border-gray-600",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(
  ({ className, align = "start", ...props }, ref) => {
    const { open } = React.useContext(DropdownMenuContext)

    if (!open) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md",
          "bg-gray-900 border border-gray-700 shadow-lg",
          "animate-in fade-in-0 zoom-in-95",
          align === "end" ? "right-0" : "left-0",
          className
        )}
        {...props}
      />
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(
  ({ className, children, onClick, ...props }, ref) => {
    const { setOpen } = React.useContext(DropdownMenuContext)

    const handleClick = (e) => {
      onClick?.(e)
      setOpen(false)
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
          "text-gray-200 hover:bg-gray-800 hover:text-white",
          "focus:bg-gray-800 focus:text-white focus:outline-none",
          "transition-colors cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-3 py-2 text-xs font-semibold text-gray-500", className)}
      {...props}
    />
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-px my-1 bg-gray-700", className)}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
