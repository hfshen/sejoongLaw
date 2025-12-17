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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
                onClick={() => onOpenChange(false)}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={cn(
                  "fixed inset-0 z-[120] flex items-center justify-center p-4",
                  "pointer-events-none",
                  className
                )}
                onClick={(e) => {
                  // 모달 내부 클릭은 이벤트 전파 방지
                  e.stopPropagation()
                }}
              >
                <div
                  className={cn(
                    "bg-white rounded-xl shadow-premium-lg p-4 md:p-8",
                    "w-full max-w-3xl",
                    "max-h-[90vh] overflow-y-auto",
                    "pointer-events-auto",
                    "focus:outline-none",
                    "relative"
                  )}
                  onClick={(e) => {
                    // 모달 콘텐츠 클릭은 이벤트 전파 방지
                    e.stopPropagation()
                  }}
                >
                  {(title || description) && (
                    <div className="mb-6 pr-10">
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
                      className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-text-secondary hover:text-secondary transition-colors focus-ring rounded-full p-2 shadow-md border border-gray-200 hover:border-gray-300"
                      aria-label="Close"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenChange(false)
                      }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

