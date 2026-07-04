"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Link2, X } from "lucide-react";
import type { LineInboxEntry } from "@/lib/types";

// Shows parents who recently added the institute's LINE Official Account (or
// messaged it) but aren't linked to a student record yet. Linking here is
// what lets "ส่งผ่าน LINE อัตโนมัติ" work for that student going forward.
export function LineInboxPanel() {
  const { students, refresh } = useStore();
  const [entries, setEntries] = React.useState<LineInboxEntry[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [selected, setSelected] = React.useState<Record<string, string>>({});
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const loadInbox = React.useCallback(async () => {
    try {
      const res = await fetch("/api/line/inbox");
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    } catch {
      // LINE isn't set up yet, or a transient error — panel just stays empty
    } finally {
      setLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  async function handleLink(entryId: string) {
    const studentId = selected[entryId];
    if (!studentId) return;
    setBusyId(entryId);
    try {
      const res = await fetch(`/api/line/inbox/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "เชื่อมบัญชีไม่สำเร็จ");
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      await refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "เชื่อมบัญชีไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDismiss(entryId: string) {
    setBusyId(entryId);
    try {
      await fetch(`/api/line/inbox/${entryId}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } finally {
      setBusyId(null);
    }
  }

  if (!loaded || entries.length === 0) return null;

  return (
    <Card className="border-success/40 bg-success/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MessageCircle className="h-4 w-4 text-success" />
          ข้อความ LINE เข้าใหม่ ({entries.length})
        </CardTitle>
        <CardDescription>
          ผู้ปกครองที่เพิ่งแอดไลน์ OA หรือพิมพ์ข้อความมา เลือกนักเรียนที่ตรงกันแล้วกด "เชื่อมบัญชี"
          เพื่อเปิดใช้การส่งแจ้งยอดอัตโนมัติให้คนนั้น
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm"
          >
            <p className="min-w-[160px] flex-1 truncate">
              <span className="text-muted-foreground">ข้อความ:</span> {entry.messageText}
            </p>
            <Select
              value={selected[entry.id] ?? ""}
              onValueChange={(v) => setSelected((prev) => ({ ...prev, [entry.id]: v }))}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="เลือกนักเรียน" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.grade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => handleLink(entry.id)}
              disabled={!selected[entry.id] || busyId === entry.id}
            >
              <Link2 className="h-3.5 w-3.5" /> เชื่อมบัญชี
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDismiss(entry.id)}
              disabled={busyId === entry.id}
              aria-label="ไม่สนใจข้อความนี้"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
