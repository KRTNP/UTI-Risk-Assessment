"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Assessment = {
  id: string;
  date: string;
  Age: number;
  Sex: string;
  Previous_UTI: string;
  Diabetes: string;
  Dysuria: string;
  Frequency: string;
  Lower_Abdominal_Pain: string;
  Fever: string;
  Leukocyte_Esterase?: string;
  Nitrite?: string;
  WBC_Count?: number;
  Hematuria?: string;
  Urine_Culture?: string;
  result: {
    rf_prediction: string;
    rf_probability: number;
    xgb_prediction: string;
    xgb_probability: number;
    risk: string;
    probability: number;
    model: string;
  };
};

type UserState = {
  assessments: Assessment[];
  addAssessment: (assessment: Assessment) => void;
  removeAssessment: (id: string) => void;
  clearAssessments: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      assessments: [],
      addAssessment: (assessment) =>
        set((state) => ({
          assessments: [...state.assessments, assessment],
        })),
      removeAssessment: (id) =>
        set((state) => ({
          assessments: state.assessments.filter((a) => a.id !== id),
        })),
      clearAssessments: () => set({ assessments: [] }),
    }),
    {
      name: 'uti-assessment-storage',
    }
  )
);

type AuthState = {
  user: null | {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor';
  };
  isAuthenticated: boolean;
  login: (user: AuthState['user']) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'uti-auth-storage',
    }
  )
);