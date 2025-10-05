import { ref } from 'vue'

export function useModal(initialVisible = false) {
  const visible = ref<boolean>(initialVisible)
  const loading = ref<boolean>(false)
  const error = ref<boolean>(false)
  const errorMessage = ref<string>('')

  const open = () => { visible.value = true }
  const close = () => { visible.value = false }
  const setLoading = (v: boolean) => { loading.value = v }
  const setError = (msg?: string) => {
    error.value = true
    errorMessage.value = msg || '发生未知错误'
  }
  const clearError = () => {
    error.value = false
    errorMessage.value = ''
  }

  // 将确认动作 Promise 化，便于统一处理 async 提交
  const confirm = async (fn: () => Promise<void> | void) => {
    try {
      setLoading(true)
      await fn()
      close()
    } catch (e: any) {
      setError(e?.message || '操作失败，请稍后重试')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return {
    visible,
    loading,
    error,
    errorMessage,
    open,
    close,
    setLoading,
    setError,
    clearError,
    confirm,
  }
}