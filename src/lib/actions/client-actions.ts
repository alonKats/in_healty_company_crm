"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { ClientSource, ClientStatus } from "@/generated/prisma";

export async function createLeadQuick(formData: FormData) {
  const name = formData.get("name") as string;
  const company = (formData.get("company") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const noteText = (formData.get("note") as string) || "";
  const serviceInterest = (formData.get("serviceInterest") as string) || "";

  const noteParts = [
    noteText,
    serviceInterest ? `תחומי עניין: ${serviceInterest}` : "",
  ].filter(Boolean);

  await prisma.client.create({
    data: {
      name,
      company,
      phone,
      notes: noteParts.join("\n") || null,
      source: "INBOUND",
      status: "LEAD",
    },
  });

  revalidatePath("/");
}

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const company = formData.get("company") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const source = formData.get("source") as ClientSource;
  const assignedToId = formData.get("assignedToId") as string | null;
  const notes = formData.get("notes") as string | null;

  const client = await prisma.client.create({
    data: {
      name,
      company: company || null,
      phone: phone || null,
      email: email || null,
      source: source || "OTHER",
      assignedToId: assignedToId || null,
      notes: notes || null,
    },
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const company = formData.get("company") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const address = formData.get("address") as string | null;
  const source = formData.get("source") as ClientSource;
  const status = formData.get("status") as ClientStatus;
  const assignedToId = formData.get("assignedToId") as string | null;
  const notes = formData.get("notes") as string | null;

  await prisma.client.update({
    where: { id },
    data: {
      name,
      company: company || null,
      phone: phone || null,
      email: email || null,
      address: address || null,
      source,
      status,
      assignedToId: assignedToId || null,
      notes: notes || null,
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });

  revalidatePath("/clients");
  redirect("/clients");
}

export async function addContact(clientId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string | null;
  const phone = formData.get("phone") as string | null;
  const email = formData.get("email") as string | null;
  const isPrimary = formData.get("isPrimary") === "true";

  await prisma.contact.create({
    data: {
      clientId,
      name,
      role: role || null,
      phone: phone || null,
      email: email || null,
      isPrimary,
    },
  });

  revalidatePath(`/clients/${clientId}`);
}

export async function deleteContact(contactId: string, clientId: string) {
  await prisma.contact.delete({ where: { id: contactId } });

  revalidatePath(`/clients/${clientId}`);
}
