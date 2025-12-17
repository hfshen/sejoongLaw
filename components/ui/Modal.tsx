"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function Modal({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                  "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                  "bg-white rounded-xl shadow-premium-lg p-4 md:p-8",
                  "w-[95vw] sm:w-[90vw] md:w-full max-w-3xl",
                  "max-h-[90vh] overflow-y-auto",
                  "z-[100] focus:outline-none",
                  "mx-2 my-2",
                  className
                )}
              >
                {(title || description) && (
                  <div className="mb-6">
                    {title && (
                      <Dialog.Title className="text-2xl font-bold text-secondary mb-2">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="text-text-secondary">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                )}
                {children}
                <Dialog.Close asChild>
                  <button
                    className="absolute top-4 right-4 text-text-secondary hover:text-secondary transition-colors focus-ring rounded-full p-1"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

