import { api } from '@/lib/axios'

interface GetDayOrdersAmountParams {
  storeId?: string
  userId?: string
}

export async function getDayOrdersAmount(params?: GetDayOrdersAmountParams) {
  const response = await api.get('/metrics/day-orders-amount', {
    params,
  })

  return response.data
}
