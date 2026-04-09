ALTER TABLE "Client" ADD COLUMN "greenInvoiceId" TEXT;
ALTER TABLE "Order" ADD COLUMN "invoiceId" TEXT;
ALTER TABLE "Order" ADD COLUMN "invoiceUrl" TEXT;
