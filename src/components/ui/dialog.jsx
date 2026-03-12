import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>
  )
}

const DialogOverlay = React.forwardRef(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 bg-black/75",
        className
      )}
      {...props}
    />
  )
)
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <>
      <DialogOverlay />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    </>
  )
)
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-bold text-white", className)}
      {...props}
    />
  )
)
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-gray-300", className)}
      {...props}
    />
  )
)
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogClose = React.forwardRef(
  ({ className, children, onClick, ...props }, ref) => (
    <Button
      ref={ref}
      variant="default"
      className={cn("w-full", className)}
      onClick={onClick}
      {...props}
    >
      {children || "Close"}
    </Button>
  )
)
DialogClose.displayName = "DialogClose"

const DialogCloseX = React.forwardRef(
  ({ className, onClick, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center",
        className
      )}
      onClick={onClick}
      aria-label="Close"
      {...props}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  )
)
DialogCloseX.displayName = "DialogCloseX"

export {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogCloseX,
}
