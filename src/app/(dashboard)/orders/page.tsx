import { getOrders } from "@/lib/queries/order-queries";
import { OrderList } from "@/components/orders/order-list";

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrderList orders={orders} />;
}
