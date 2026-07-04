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
import {
  seedStudents,
  seedCourses,
  seedEnrollments,
  seedAttendance,
  seedTransactions,
  seedExpenses,
} from "./mock-data";
import { uid } from "./utils";

// ---------------------------------------------------------------------------
// This Context is a client-side, in-memory data layer that stands in for a
// real backend. Every mutation function below (addTransaction, addExpense,
// markAttendance, ...) is written as a single call-site so that swapping the
// body for `await fetch("/api/...")` + refetch/optimistic-update is a small,
// localized change per function — the components themselves never touch
// state directly, only these actions.
//
// Data is mirrored to localStorage purely so the demo survives page reloads;
// remove that when a real database is connected.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "chula-iq-admin-store-v1";

interface PersistedState {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  attendance: AttendanceRecord[];
  transactions: Transaction[];
  expenses: Expense[];
}

function seedState(): PersistedState {
  return {
    students: seedStudents,
    courses: seedCourses,
    enrollments: seedEnrollments,
    attendance: seedAttendance,
    transactions: seedTransactions,
    expenses: seedExpenses,
  };
}

interface StoreContextValue {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  attendance: AttendanceRecord[];
  transactions: Transaction[];
  expenses: Expense[];

  // selectors
  getStudent: (id: string) => Student | undefined;
  getCourse: (id: string) => Course | undefined;
  getEnrollmentsForCourse: (courseId: string) => Enrollment[];
  getEnrollmentsForStudent: (studentId: string) => Enrollment[];

  // mutations
  addTransaction: (input: {
    studentId: string;
    courseId: string;
    amount: number;
    method: PaymentMethod;
    slipImage?: string;
    note?: string;
  }) => void;
  addExpense: (input: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    method: PaymentMethod;
    receiptImage?: string;
  }) => void;
  markAttendance: (enrollmentId: string, status: AttendanceStatus) => void;
  updateEnrollmentHours: (enrollmentId: string, monthlyHours: number) => void;
  updateEnrollmentFee: (enrollmentId: string, monthlyFee: number) => void;
  updateCoursePrice: (
    courseId: string,
    patch: { hourlyRate?: number; defaultMonthlyHours?: number; monthlyFee?: number }
  ) => void;
  addStudent: (input: {
    name: string;
    grade: string;
    parentName: string;
    parentLine: string;
    parentFacebook: string;
    phone?: string;
  }) => string;
  addCourse: (input: {
    name: string;
    subject: string;
    type: Course["type"];
    hourlyRate?: number;
    defaultMonthlyHours?: number;
    monthlyFee?: number;
  }) => string;
  addEnrollment: (input: {
    studentId: string;
    courseId: string;
    monthlyHours?: number;
    monthlyFee?: number;
    sessionHours?: number;
  }) => void;
  deleteStudent: (studentId: string) => void;
  deleteCourse: (courseId: string) => void;
  markAllPresent: (courseId: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Always start from deterministic seed data so server-rendered HTML and the
  // client's first render match exactly (avoids hydration mismatches).
  const [state, setState] = useState<PersistedState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  // After mount, pull any previously saved data from localStorage. This only
  // runs in the browser, so it can never disagree with the server render.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as PersistedState);
    } catch {
      // ignore corrupt storage, keep seed data
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return; // avoid overwriting saved data with seed data pre-load
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full/unavailable — non-fatal for a demo app
    }
  }, [state, hydrated]);

  const getStudent = (id: string) => state.students.find((s) => s.id === id);
  const getCourse = (id: string) => state.courses.find((c) => c.id === id);
  const getEnrollmentsForCourse = (courseId: string) =>
    state.enrollments.filter((e) => e.courseId === courseId);
  const getEnrollmentsForStudent = (studentId: string) =>
    state.enrollments.filter((e) => e.studentId === studentId);

  function addTransaction(input: {
    studentId: string;
    courseId: string;
    amount: number;
    method: PaymentMethod;
    slipImage?: string;
    note?: string;
  }) {
    const tx: Transaction = {
      id: uid("tx"),
      createdAt: new Date().toISOString(),
      ...input,
    };
    setState((prev) => ({ ...prev, transactions: [tx, ...prev.transactions] }));
  }

  function addExpense(input: {
    title: string;
    amount: number;
    category: ExpenseCategory;
    method: PaymentMethod;
    receiptImage?: string;
  }) {
    const ex: Expense = {
      id: uid("ex"),
      createdAt: new Date().toISOString(),
      ...input,
    };
    setState((prev) => ({ ...prev, expenses: [ex, ...prev.expenses] }));
  }

  function markAttendance(enrollmentId: string, status: AttendanceStatus) {
    setState((prev) => {
      const enrollment = prev.enrollments.find((e) => e.id === enrollmentId);
      if (!enrollment) return prev;

      const hoursCounted = status === "present" ? enrollment.sessionHours : 0;
      const record: AttendanceRecord = {
        id: uid("at"),
        enrollmentId,
        date: new Date().toISOString().slice(0, 10),
        status,
        hoursCounted,
      };

      const enrollments = prev.enrollments.map((e) =>
        e.id === enrollmentId
          ? { ...e, hoursUsed: Math.min(e.hoursUsed + hoursCounted, e.monthlyHours ?? Infinity) }
          : e
      );

      return {
        ...prev,
        enrollments,
        attendance: [record, ...prev.attendance],
      };
    });
  }

  function updateEnrollmentHours(enrollmentId: string, monthlyHours: number) {
    setState((prev) => ({
      ...prev,
      enrollments: prev.enrollments.map((e) =>
        e.id === enrollmentId ? { ...e, monthlyHours } : e
      ),
    }));
  }

  function updateEnrollmentFee(enrollmentId: string, monthlyFee: number) {
    setState((prev) => ({
      ...prev,
      enrollments: prev.enrollments.map((e) =>
        e.id === enrollmentId ? { ...e, monthlyFee } : e
      ),
    }));
  }

  function updateCoursePrice(
    courseId: string,
    patch: { hourlyRate?: number; defaultMonthlyHours?: number; monthlyFee?: number }
  ) {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)),
    }));
  }

  function addStudent(input: {
    name: string;
    grade: string;
    parentName: string;
    parentLine: string;
    parentFacebook: string;
    phone?: string;
  }) {
    const id = uid("st");
    const student: Student = { id, ...input };
    setState((prev) => ({ ...prev, students: [...prev.students, student] }));
    return id;
  }

  function addCourse(input: {
    name: string;
    subject: string;
    type: Course["type"];
    hourlyRate?: number;
    defaultMonthlyHours?: number;
    monthlyFee?: number;
  }) {
    const id = uid("co");
    const course: Course = { id, ...input };
    setState((prev) => ({ ...prev, courses: [...prev.courses, course] }));
    return id;
  }

  function addEnrollment(input: {
    studentId: string;
    courseId: string;
    monthlyHours?: number;
    monthlyFee?: number;
    sessionHours?: number;
  }) {
    const enrollment: Enrollment = {
      id: uid("en"),
      studentId: input.studentId,
      courseId: input.courseId,
      monthlyHours: input.monthlyHours,
      monthlyFee: input.monthlyFee,
      hoursUsed: 0,
      sessionHours: input.sessionHours ?? 1.5,
    };
    setState((prev) => ({ ...prev, enrollments: [...prev.enrollments, enrollment] }));
  }

  function deleteStudent(studentId: string) {
    setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
      enrollments: prev.enrollments.filter((e) => e.studentId !== studentId),
    }));
  }

  function deleteCourse(courseId: string) {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== courseId),
      enrollments: prev.enrollments.filter((e) => e.courseId !== courseId),
    }));
  }

  function markAllPresent(courseId: string) {
    setState((prev) => {
      const today = new Date().toISOString().slice(0, 10);
      const targetEnrollments = prev.enrollments.filter((e) => e.courseId === courseId);

      const newRecords: AttendanceRecord[] = targetEnrollments.map((e) => ({
        id: uid("at"),
        enrollmentId: e.id,
        date: today,
        status: "present",
        hoursCounted: e.sessionHours,
      }));

      const enrollments = prev.enrollments.map((e) =>
        e.courseId === courseId
          ? { ...e, hoursUsed: Math.min(e.hoursUsed + e.sessionHours, e.monthlyHours ?? Infinity) }
          : e
      );

      return { ...prev, enrollments, attendance: [...newRecords, ...prev.attendance] };
    });
  }

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      getStudent,
      getCourse,
      getEnrollmentsForCourse,
      getEnrollmentsForStudent,
      addTransaction,
      addExpense,
      markAttendance,
      updateEnrollmentHours,
      updateEnrollmentFee,
      updateCoursePrice,
      addStudent,
      addCourse,
      addEnrollment,
      deleteStudent,
      deleteCourse,
      markAllPresent,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
