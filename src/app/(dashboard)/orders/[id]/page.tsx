import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries/order-queries";
import { OrderDetail } from "@/components/orders/order-detail";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} />;
}
