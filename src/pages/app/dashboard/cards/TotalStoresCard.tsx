import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics'

export function TotalStoresCard() {
  const { data, isLoading } = useDashboardMetrics()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total de Estabelecimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold">
          {isLoading ? '...' : data?.totalStores ?? 0}
        </span>
      </CardContent>
    </Card>
  )
}
