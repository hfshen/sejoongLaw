"use client"

import { TextareaHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "outline"
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "w-full"
    
    const variants = {
      default: "premium-textarea",
      outline: "premium-input border-gray-300 bg-transparent min-h-[120px] resize-y",
    }

    return (
      <textarea
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export default Textarea
