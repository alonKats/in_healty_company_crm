"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/settings-actions";
import type { Category } from "@/generated/prisma";

type CategoryWithRelations = Category & {
  children: Category[];
  parent: Category | null;
};

interface CategoryManagementProps {
  categories: CategoryWithRelations[];
}

export function CategoryManagement({ categories }: CategoryManagementProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryWithRelations | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createCategory(formData);
      setAddOpen(false);
    });
  }

  async function handleUpdate(formData: FormData) {
    if (!editTarget) return;
    startTransition(async () => {
      await updateCategory(editTarget.id, formData);
      setEditTarget(null);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק קטגוריה זו?")) return;
    startTransition(async () => {
      await deleteCategory(id);
    });
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger
            render={
              <Button variant="default" />
            }
          >
            הוסף קטגוריה
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>קטגוריה חדשה</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-name">שם *</Label>
                <Input id="add-name" name="name" placeholder="שם קטגוריה" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-sortOrder">סדר מיון</Label>
                <Input
                  id="add-sortOrder"
                  name="sortOrder"
                  type="number"
                  placeholder="0"
                  defaultValue={0}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  ביטול
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "שומר..." : "צור"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>ערוך קטגוריה</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">שם *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editTarget.name}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-sortOrder">סדר מיון</Label>
                <Input
                  id="edit-sortOrder"
                  name="sortOrder"
                  type="number"
                  defaultValue={editTarget.sortOrder}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditTarget(null)}
                >
                  ביטול
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "שומר..." : "שמור"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Category list */}
      <ul className="divide-y border rounded-lg">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="font-medium">{cat.name}</span>
              {cat.parent && (
                <span className="text-xs text-muted-foreground mr-2">
                  תת של: {cat.parent.name}
                </span>
              )}
              <span className="text-xs text-muted-foreground mr-2">
                (סדר: {cat.sortOrder})
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditTarget(cat)}
                disabled={isPending}
              >
                ערוך
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(cat.id)}
                disabled={isPending}
              >
                מחק
              </Button>
            </div>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            אין קטגוריות
          </li>
        )}
      </ul>
    </div>
  );
}
