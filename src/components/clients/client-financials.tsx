"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkIcon } from "lucide-react";

interface Document {
  id: string;
  clientName: string;
  amount: number;
  status: number;
  date: string;
  type: number;
  url: string;
}

interface ClientFinancialsData {
  documents: Document[];
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
}

const STATUS_LABELS: Record<number, string> = {
  0: "טיוטה",
  1: "סופי",
  2: "שולם",
  3: "שולם חלקית",
  4: "בוטל",
};

function statusClassName(status: number): string {
  if (status === 2) return "bg-green-100 text-green-700 border-green-200";
  if (status === 1 || status === 3) return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === 4) return "bg-red-100 text-red-700 border-red-200";
  return "";
}

function fmt(n: number) {
  return `₪${n.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function ClientFinancials({ data }: { data: ClientFinancialsData | null }) {
  if (data === null) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">לא מקושר לחשבונית ירוקה</p>
        <p className="text-xs text-slate-400 mt-1">
          ניתן לקשר לקוח זה דרך עריכת פרטי הלקוח
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500">סה&quot;כ חשבוניות</span>
            <div className="text-xl font-bold text-slate-800 mt-1">{fmt(data.totalInvoiced)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500">שולם</span>
            <div className="text-xl font-bold text-green-600 mt-1">{fmt(data.totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs text-slate-500">יתרה פתוחה</span>
            <div className={`text-xl font-bold mt-1 ${data.outstanding > 0 ? "text-red-500" : "text-slate-800"}`}>
              {fmt(data.outstanding)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents list */}
      {data.documents.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground text-sm">אין מסמכים</p>
      ) : (
        <div className="space-y-2">
          {data.documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{formatDate(doc.date)}</span>
                    <span className="text-sm font-medium text-slate-700">{fmt(doc.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusClassName(doc.status)}>
                      {STATUS_LABELS[doc.status] ?? `סטטוס ${doc.status}`}
                    </Badge>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded hover:bg-slate-100 text-teal-600 hover:text-teal-700 transition-colors"
                        title="פתח בחשבונית ירוקה"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
