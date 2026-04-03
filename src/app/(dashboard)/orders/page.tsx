import { getOrders } from "@/lib/queries/order-queries";
import { OrderList } from "@/components/orders/order-list";
import { serialize } from "@/lib/utils";

export default async function OrdersPage() {
  const orders = serialize(await getOrders());
  return <OrderList orders={orders} />;
}
