import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed top-4 z-[100] flex max-h-screen w-full flex-col p-4",
        "sm:top-4 sm:flex-col sm:max-w-sm",
        isRTL ? "sm:left-4" : "sm:right-4",
        className
      )}
      {...props}
    />
  )
})
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-xl border bg-white p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-top-full dark:bg-gray-900",
  {
    variants: {
      variant: {
        default: "border-gray-200 dark:border-gray-700",
        success: "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800",
        destructive: "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
        warning: "border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800",
        info: "border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const variantStyles = {
  success: "text-green-700 dark:text-green-300",
  destructive: "text-red-700 dark:text-red-300", 
  warning: "text-amber-700 dark:text-amber-300",
  info: "text-blue-700 dark:text-blue-300",
  default: "text-gray-900 dark:text-gray-100",
}

const variantIcons = {
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  default: null,
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      duration?: number
      showIcon?: boolean
    }
>(({ className, variant = "default", duration = 4000, showIcon = true, ...props }, ref) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  const Icon = variantIcons[variant]

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      duration={duration}
      dir={isRTL ? 'rtl' : 'ltr'}
      {...props}
    >
      <div className={cn(
        "flex items-center w-full min-w-0",
        isRTL ? "space-x-reverse space-x-3" : "space-x-3"
      )}>
        {showIcon && Icon && (
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", variantStyles[variant])} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {props.children}
        </div>
      </div>
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-transparent px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        "absolute top-3 flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800",
        isRTL ? "left-3" : "right-3",
        className
      )}
      aria-label={language === 'ar' ? 'إغلاق الإشعار' : 'Close notification'}
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
})
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn(
        "text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100",
        isRTL && "text-right",
        className
      )}
      {...props}
    />
  )
})
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => {
  const { language } = useLanguage()
  const isRTL = language === 'ar'
  
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn(
        "text-sm text-gray-600 dark:text-gray-300 leading-relaxed",
        isRTL && "text-right",
        className
      )}
      {...props}
    />
  )
})
ToastDescription.displayName = ToastPrimitives.Description.displayName

// مكونات جاهزة للاستخدام السريع
export const SimpleToast: React.FC<{
  variant?: 'success' | 'destructive' | 'warning' | 'info' | 'default'
  title?: string
  message: string
  showClose?: boolean
}> = ({ variant = 'default', title, message, showClose = true }) => (
  <>
    <div className="pr-8">
      {title && <ToastTitle>{title}</ToastTitle>}
      <ToastDescription className={title ? "mt-1" : ""}>{message}</ToastDescription>
    </div>
    {showClose && <ToastClose />}
  </>
)

export const LoadingToast: React.FC<{ message: string }> = ({ message }) => (
  <>
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
      </div>
      <ToastDescription>{message}</ToastDescription>
    </div>
  </>
)

// Hook مبسط للاستخدام
export const useToast = () => {
  const { language } = useLanguage()
  
  const showToast = React.useCallback((
    message: string,
    options?: {
      variant?: 'success' | 'destructive' | 'warning' | 'info' | 'default'
      title?: string
      duration?: number
    }
  ) => {
    // هذا مجرد placeholder - يحتاج تنفيذ حقيقي حسب نظام Toast management الخاص بك
    console.log('Toast:', { message, ...options })
  }, [])

  return {
    toast: showToast,
    success: React.useCallback((message: string, title?: string) => 
      showToast(message, { variant: 'success', title }), [showToast]),
    error: React.useCallback((message: string, title?: string) => 
      showToast(message, { variant: 'destructive', title }), [showToast]),
    warning: React.useCallback((message: string, title?: string) => 
      showToast(message, { variant: 'warning', title }), [showToast]),
    info: React.useCallback((message: string, title?: string) => 
      showToast(message, { variant: 'info', title }), [showToast]),
  }
}

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
