import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/axios'

interface WeekOrdersAmount {
  amount: number
  diffFromLastWeek: number
}

export function useWeekOrdersAmount(storeId?: string, userId?: string) {
  return useQuery<WeekOrdersAmount>({
    queryKey: ['metrics', 'week-orders-amount', storeId, userId],
    queryFn: async () => {
      const response = await api.get('/dashboard/week-orders-amount', {
        params: { storeId, userId },
      })
      return response.data
    },
  })
}
