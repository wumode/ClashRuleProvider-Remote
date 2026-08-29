import { inject } from 'vue'

export interface HostToast {
  error(message: string): unknown
  info(message: string): unknown
  success(message: string): unknown
  warning(message: string): unknown
}

export function useToast(): HostToast {
  const toast = inject<HostToast | null>('moviepilot:toast', null)
  return {
    success: (message: string) => toast?.success(message),
    error: (message: string) => toast?.error(message),
    info: (message: string) => toast?.info(message),
    warning: (message: string) => toast?.warning(message)
  }
}
