import { OrderActions } from "./OrderActions";

interface Order {
  id: string;
  userName: string;
  storeName: string;
  total: number;
}

interface OrderTableProps {
  orders: Order[] | undefined;
  isLoading: boolean;
}

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  if (isLoading) return <p>Carregando...</p>;

  return (
    <div className="overflow-x-auto rounded border border-border bg-background shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Loja</th>
            <th className="p-2">Valor</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((order) => (
            <tr key={order.id} className="border-t border-border">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.userName}</td>
              <td className="p-2">{order.storeName}</td>
              <td className="p-2">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(order.total)}
              </td>
              <td className="p-2">
                <OrderActions orderId={order.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
