import { create } from "zustand";

interface Customer {
  id: string;
  email: string;
  name: string;
}

interface CustomerAuthState {
  customer: Customer | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (customer: Customer, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  customer: null,
  accessToken: null,
  isLoading: true,
  setAuth: (customer, accessToken) =>
    set({ customer, accessToken, isLoading: false }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ customer: null, accessToken: null, isLoading: false }),
}));
