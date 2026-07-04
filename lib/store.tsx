"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  Student,
  Course,
  Enrollment,
  AttendanceRecord,
  AttendanceStatus,
  Transaction,
  Expense,
  ExpenseCategory,
  PaymentMethod,
} from "./types";

// ---------------------------------------------------------------------------
// This Context is the app's single data-access layer, now backed by a real
// Postgres database (Supabase) instead of localStorage. Every mutation
// function below calls a Next.js API route (app/api/**), which is the only
// thing allowed to talk to Supabase (using a server-only service-role key —
// see lib/supabase.ts). Components never call fetch() directly; they only
// ever use the functions exposed by useStore().
//
// Each mutation is optimistic-free but still fast: it awaits the API call,
// and only updates React state once the database confirms the write. If the
// request fails, an alert explains what happened and local state is left
// untouched, so the UI never drifts out of sync with the database.
// ---------------------------------------------------------------------------

interface DataState {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  attendance: AttendanceRecord[];
  transactions: Transaction[];
  expenses: Expense[];
}

const EMPTY_STATE: DataState = {
  students: [],
  courses: [],
  enrollments: [],
  attendance: [],
  transactions: [],
  expenses: [],
};

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error ?? `เกิดข้อผิดพลาด (HTTP ${res.status})`);
  }
  return body as T;
}

function reportError(action: string, err: unknown) {
  const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
  console.error(action, err);
  if (typeof window !== "undefined") window.alert(message);
}

interface StoreContextValue extends DataState {
  loading: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;

  // selectors
  getStudent: (id: string) => Student | undefined;
  getCourse: (id: string) => Course | undefined;
  getEnrollmentsForCourse: (courseId: string) => Enrollment[];
  getEnrollmentsForStudent: (studentId: string) => Enrollment[];

  // mutations — all persist to Supabase via app/api/** before updating state
  addTransaction: (input: {
    studentId: string;
    courseId: string;
    amount: number;
    method: PaymentMethod;
    slipImage?: string;
    note?: string;
  }) => Promise<boolean>;
  updateTransaction: (
    id: string,
    patch: Partial<{
      studentId: string;
      courseId: string;
      amount: number;
      method: PaymentMethod;
      slipImage?: string;
      note?: string;
    }>
  ) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;

  addExpense: (input: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    method: PaymentMethod;
    receiptImage?: string;
  }) => Promise<boolean>;
  updateExpense: (
    id: string,
    patch: Partial<{
      title: string;
      amount: number;
      category: ExpenseCategory;
      method: PaymentMethod;
      receiptImage?: string;
    }>
  ) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;

  markAttendance: (enrollmentId: string, status: AttendanceStatus) => Promise<boolean>;
  markAllPresent: (courseId: string) => Promise<boolean>;

  updateEnrollmentHours: (enrollmentId: string, monthlyHours: number) => Promise<boolean>;
  updateEnrollmentFee: (enrollmentId: string, monthlyFee: number) => Promise<boolean>;
  updateCoursePrice: (
    courseId: string,
    patch: { hourlyRate?: number; defaultMonthlyHours?: number; monthlyFee?: number }
  ) => Promise<boolean>;

  addStudent: (input: {
    name: string;
    grade: string;
    parentName: string;
    parentLine: string;
    parentFacebook: string;
    phone?: string;
  }) => Promise<string | null>;
  addCourse: (input: {
    name: string;
    subject: string;
    type: Course["type"];
    hourlyRate?: number;
    defaultMonthlyHours?: number;
    monthlyFee?: number;
  }) => Promise<string | null>;
  addEnrollment: (input: {
    studentId: string;
    courseId: string;
    monthlyHours?: number;
    monthlyFee?: number;
    sessionHours?: number;
  }) => Promise<boolean>;
  deleteStudent: (studentId: string) => Promise<boolean>;
  deleteCourse: (courseId: string) => Promise<boolean>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function refresh() {
    try {
      const data = await apiFetch<DataState>("/api/data");
      setState(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStudent = (id: string) => state.students.find((s) => s.id === id);
  const getCourse = (id: string) => state.courses.find((c) => c.id === id);
  const getEnrollmentsForCourse = (courseId: string) =>
    state.enrollments.filter((e) => e.courseId === courseId);
  const getEnrollmentsForStudent = (studentId: string) =>
    state.enrollments.filter((e) => e.studentId === studentId);

  async function addTransaction(input: {
    studentId: string;
    courseId: string;
    amount: number;
    method: PaymentMethod;
    slipImage?: string;
    note?: string;
  }) {
    try {
      const tx = await apiFetch<Transaction>("/api/transactions", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setState((prev) => ({ ...prev, transactions: [tx, ...prev.transactions] }));
      return true;
    } catch (err) {
      reportError("addTransaction", err);
      return false;
    }
  }

  async function updateTransaction(
    id: string,
    patch: Partial<{
      studentId: string;
      courseId: string;
      amount: number;
      method: PaymentMethod;
      slipImage?: string;
      note?: string;
    }>
  ) {
    try {
      const tx = await apiFetch<Transaction>(`/api/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) => (t.id === id ? tx : t)),
      }));
      return true;
    } catch (err) {
      reportError("updateTransaction", err);
      return false;
    }
  }

  async function deleteTransaction(id: string) {
    try {
      await apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }));
      return true;
    } catch (err) {
      reportError("deleteTransaction", err);
      return false;
    }
  }

  async function addExpense(input: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    method: PaymentMethod;
    receiptImage?: string;
  }) {
    try {
      const ex = await apiFetch<Expense>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setState((prev) => ({ ...prev, expenses: [ex, ...prev.expenses] }));
      return true;
    } catch (err) {
      reportError("addExpense", err);
      return false;
    }
  }

  async function updateExpense(
    id: string,
    patch: Partial<{
      title: string;
      amount: number;
      category: ExpenseCategory;
      method: PaymentMethod;
      receiptImage?: string;
    }>
  ) {
    try {
      const ex = await apiFetch<Expense>(`/api/expenses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setState((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === id ? ex : e)),
      }));
      return true;
    } catch (err) {
      reportError("updateExpense", err);
      return false;
    }
  }

  async function deleteExpense(id: string) {
    try {
      await apiFetch(`/api/expenses/${id}`, { method: "DELETE" });
      setState((prev) => ({ ...prev, expenses: prev.expenses.filter((e) => e.id !== id) }));
      return true;
    } catch (err) {
      reportError("deleteExpense", err);
      return false;
    }
  }

  async function markAttendance(enrollmentId: string, status: AttendanceStatus) {
    const enrollment = state.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return false;

    const hoursCounted = status === "present" ? enrollment.sessionHours : 0;
    const today = new Date().toISOString().slice(0, 10);

    try {
      const records = await apiFetch<AttendanceRecord[]>("/api/attendance", {
        method: "POST",
        body: JSON.stringify({
          records: [{ enrollmentId, date: today, status, hoursCounted }],
        }),
      });
      setState((prev) => ({ ...prev, attendance: [...records, ...prev.attendance] }));
      return true;
    } catch (err) {
      reportError("markAttendance", err);
      return false;
    }
  }

  async function markAllPresent(courseId: string) {
    const targetEnrollments = state.enrollments.filter((e) => e.courseId === courseId);
    if (targetEnrollments.length === 0) return false;

    const today = new Date().toISOString().slice(0, 10);
    const records = targetEnrollments.map((e) => ({
      enrollmentId: e.id,
      date: today,
      status: "present" as const,
      hoursCounted: e.sessionHours,
    }));

    try {
      const inserted = await apiFetch<AttendanceRecord[]>("/api/attendance", {
        method: "POST",
        body: JSON.stringify({ records }),
      });
      setState((prev) => ({ ...prev, attendance: [...inserted, ...prev.attendance] }));
      return true;
    } catch (err) {
      reportError("markAllPresent", err);
      return false;
    }
  }

  async function updateEnrollmentHours(enrollmentId: string, monthlyHours: number) {
    try {
      const updated = await apiFetch<Enrollment>(`/api/enrollments/${enrollmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ monthlyHours }),
      });
      setState((prev) => ({
        ...prev,
        enrollments: prev.enrollments.map((e) => (e.id === enrollmentId ? updated : e)),
      }));
      return true;
    } catch (err) {
      reportError("updateEnrollmentHours", err);
      return false;
    }
  }

  async function updateEnrollmentFee(enrollmentId: string, monthlyFee: number) {
    try {
      const updated = await apiFetch<Enrollment>(`/api/enrollments/${enrollmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ monthlyFee }),
      });
      setState((prev) => ({
        ...prev,
        enrollments: prev.enrollments.map((e) => (e.id === enrollmentId ? updated : e)),
      }));
      return true;
    } catch (err) {
      reportError("updateEnrollmentFee", err);
      return false;
    }
  }

  async function updateCoursePrice(
    courseId: string,
    patch: { hourlyRate?: number; defaultMonthlyHours?: number; monthlyFee?: number }
  ) {
    try {
      const updated = await apiFetch<Course>(`/api/courses/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setState((prev) => ({
        ...prev,
        courses: prev.courses.map((c) => (c.id === courseId ? updated : c)),
      }));
      return true;
    } catch (err) {
      reportError("updateCoursePrice", err);
      return false;
    }
  }

  async function addStudent(input: {
    name: string;
    grade: string;
    parentName: string;
    parentLine: string;
    parentFacebook: string;
    phone?: string;
  }) {
    try {
      const student = await apiFetch<Student>("/api/students", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setState((prev) => ({ ...prev, students: [...prev.students, student] }));
      return student.id;
    } catch (err) {
      reportError("addStudent", err);
      return null;
    }
  }

  async function addCourse(input: {
    name: string;
    subject: string;
    type: Course["type"];
    hourlyRate?: number;
    defaultMonthlyHours?: number;
    monthlyFee?: number;
  }) {
    try {
      const course = await apiFetch<Course>("/api/courses", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setState((prev) => ({ ...prev, courses: [...prev.courses, course] }));
      return course.id;
    } catch (err) {
      reportError("addCourse", err);
      return null;
    }
  }

  async function addEnrollment(input: {
    studentId: string;
    courseId: string;
    monthlyHours?: number;
    monthlyFee?: number;
    sessionHours?: number;
  }) {
    try {
      const enrollment = await apiFetch<Enrollment>("/api/enrollments", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setState((prev) => ({ ...prev, enrollments: [...prev.enrollments, enrollment] }));
      return true;
    } catch (err) {
      reportError("addEnrollment", err);
      return false;
    }
  }

  async function deleteStudent(studentId: string) {
    try {
      await apiFetch(`/api/students/${studentId}`, { method: "DELETE" });
      setState((prev) => ({
        ...prev,
        students: prev.students.filter((s) => s.id !== studentId),
        enrollments: prev.enrollments.filter((e) => e.studentId !== studentId),
      }));
      return true;
    } catch (err) {
      reportError("deleteStudent", err);
      return false;
    }
  }

  async function deleteCourse(courseId: string) {
    try {
      await apiFetch(`/api/courses/${courseId}`, { method: "DELETE" });
      setState((prev) => ({
        ...prev,
        courses: prev.courses.filter((c) => c.id !== courseId),
        enrollments: prev.enrollments.filter((e) => e.courseId !== courseId),
      }));
      return true;
    } catch (err) {
      reportError("deleteCourse", err);
      return false;
    }
  }

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      loading,
      loadError,
      refresh,
      getStudent,
      getCourse,
      getEnrollmentsForCourse,
      getEnrollmentsForStudent,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addExpense,
      updateExpense,
      deleteExpense,
      markAttendance,
      markAllPresent,
      updateEnrollmentHours,
      updateEnrollmentFee,
      updateCoursePrice,
      addStudent,
      addCourse,
      addEnrollment,
      deleteStudent,
      deleteCourse,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading, loadError]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
