import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/axios'

interface DayOrdersAmountResponse {
  amount: number
  diffFromYesterday: number
}

export function useDayOrdersAmount(storeId?: string, userId?: string) {
  return useQuery<DayOrdersAmountResponse>({
    queryKey: ['day-orders-amount', storeId, userId],
    queryFn: async () => {
      const response = await api.get('/dashboard/day-orders-amount', {
        params: {
          storeId,
          userId,
        },
      })
      return response.data
    },
  })
}
