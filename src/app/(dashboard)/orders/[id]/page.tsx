import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/queries/order-queries";
import { OrderDetail } from "@/components/orders/order-detail";
import { serialize } from "@/lib/utils";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = serialize(await getOrderById(id));

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} />;
}
