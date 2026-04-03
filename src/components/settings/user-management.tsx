"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createUser, deleteUser } from "@/lib/actions/settings-actions";
import type { User } from "@/generated/prisma";

interface UserManagementProps {
  users: User[];
}

export function UserManagement({ users }: UserManagementProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("role", role);
    startTransition(async () => {
      await createUser(formData);
      setOpen(false);
      setRole("STAFF");
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק משתמש זה?")) return;
    startTransition(async () => {
      await deleteUser(id);
    });
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="default" />
            }
          >
            הוסף משתמש
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>משתמש חדש</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">שם *</Label>
                <Input id="name" name="name" placeholder="שם מלא" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">אימייל *</Label>
                <Input id="email" name="email" type="email" placeholder="email@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">סיסמה *</Label>
                <Input id="password" name="password" type="password" placeholder="סיסמה" required minLength={6} />
              </div>
              <div className="space-y-1.5">
                <Label>תפקיד</Label>
                <Select value={role} onValueChange={(v) => v && setRole(v as "ADMIN" | "STAFF")}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">מנהל</SelectItem>
                    <SelectItem value="STAFF">צוות</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  ביטול
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "שומר..." : "צור משתמש"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם</TableHead>
            <TableHead>אימייל</TableHead>
            <TableHead>תפקיד</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role === "ADMIN" ? "מנהל" : "צוות"}
                </Badge>
              </TableCell>
              <TableCell>
                {session?.user?.id !== user.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(user.id)}
                    disabled={isPending}
                  >
                    מחק
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
