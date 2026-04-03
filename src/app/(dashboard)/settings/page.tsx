import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import { getCategories } from "@/lib/queries/service-queries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/settings/user-management";
import { CategoryManagement } from "@/components/settings/category-management";

export default async function SettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const [users, categories] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    getCategories(),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">הגדרות</h2>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">משתמשים</TabsTrigger>
          <TabsTrigger value="categories">קטגוריות</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserManagement users={serialize(users)} />
        </TabsContent>
        <TabsContent value="categories">
          <CategoryManagement categories={serialize(categories)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
