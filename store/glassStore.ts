// store/glassStore.ts
import { create } from "zustand";
import { IGlassStock } from "@/lib/models/GlassStock";
import { IOrder } from "@/lib/models/Order.ts";
import { IGlassIssue } from "@/lib/models/GlassIssue";

interface GlassStore {
  // Glass Stock
  glassStock: IGlassStock[];
  totalStockValue: number;
  lowStockItems: IGlassStock[];

  // Orders
  orders: IOrder[];
  totalOrders: number;
  pendingOrders: IOrder[];

  // Glass Issues
  glassIssues: IGlassIssue[];

  // Actions for Glass Stock
  setGlassStock: (stock: IGlassStock[]) => void;
  addGlassStock: (item: IGlassStock) => void;
  updateGlassStock: (id: string, item: IGlassStock) => void;
  deleteGlassStock: (id: string) => void;
  setTotalStockValue: (value: number) => void;
  updateLowStockItems: () => void;

  // Actions for Orders
  setOrders: (orders: IOrder[]) => void;
  addOrder: (order: IOrder) => void;
  updateOrder: (id: string, order: IOrder) => void;
  deleteOrder: (id: string) => void;
  setTotalOrders: (total: number) => void;

  // Actions for Glass Issues
  setGlassIssues: (issues: IGlassIssue[]) => void;
  addGlassIssue: (issue: IGlassIssue) => void;

  // Common
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGlassStore = create<GlassStore>((set) => ({
  // Initial state
  glassStock: [],
  totalStockValue: 0,
  lowStockItems: [],
  orders: [],
  totalOrders: 0,
  pendingOrders: [],
  glassIssues: [],
  loading: false,
  error: null,

  // Glass Stock actions
  setGlassStock: (glassStock) =>
    set({
      glassStock,
      lowStockItems: glassStock.filter((item) => item.currentQuantity < 10), // Example: less than 10 units
    }),

  addGlassStock: (item) =>
    set((state) => {
      const newStock = [item, ...state.glassStock];
      const newValue =
        state.totalStockValue + item.currentQuantity * item.unitPrice;
      const lowStock =
        item.currentQuantity < 10
          ? [...state.lowStockItems, item]
          : state.lowStockItems;

      return {
        glassStock: newStock,
        totalStockValue: newValue,
        lowStockItems: lowStock,
      };
    }),

  updateGlassStock: (id, item) =>
    set((state) => {
      const oldItem = state.glassStock.find((s) => s._id?.toString() === id);
      const newStock = state.glassStock.map((s) =>
        s._id?.toString() === id ? item : s
      );

      let newValue = state.totalStockValue;
      if (oldItem) {
        const oldValue = oldItem.currentQuantity * oldItem.unitPrice;
        const newValueForItem = item.currentQuantity * item.unitPrice;
        newValue = state.totalStockValue - oldValue + newValueForItem;
      }

      const lowStock = newStock.filter((item) => item.currentQuantity < 10);

      return {
        glassStock: newStock,
        totalStockValue: newValue,
        lowStockItems: lowStock,
      };
    }),

  deleteGlassStock: (id) =>
    set((state) => {
      const itemToDelete = state.glassStock.find(
        (s) => s._id?.toString() === id
      );
      const newStock = state.glassStock.filter((s) => s._id?.toString() !== id);

      let newValue = state.totalStockValue;
      if (itemToDelete) {
        const valueToRemove =
          itemToDelete.currentQuantity * itemToDelete.unitPrice;
        newValue = state.totalStockValue - valueToRemove;
      }

      const lowStock = newStock.filter((item) => item.currentQuantity < 10);

      return {
        glassStock: newStock,
        totalStockValue: newValue,
        lowStockItems: lowStock,
      };
    }),

  setTotalStockValue: (totalStockValue) => set({ totalStockValue }),

  updateLowStockItems: () =>
    set((state) => ({
      lowStockItems: state.glassStock.filter(
        (item) => item.currentQuantity < 10
      ),
    })),

  // Order actions
  setOrders: (orders) =>
    set({
      orders,
      totalOrders: orders.length,
      pendingOrders: orders.filter(
        (order) => order.status === "pending" || order.status === "processing"
      ),
    }),

  addOrder: (order) =>
    set((state) => {
      const newOrders = [order, ...state.orders];
      const pendingOrders = newOrders.filter(
        (o) => o.status === "pending" || o.status === "processing"
      );

      return {
        orders: newOrders,
        totalOrders: state.totalOrders + 1,
        pendingOrders,
      };
    }),

  updateOrder: (id, order) =>
    set((state) => {
      const newOrders = state.orders.map((o) =>
        o._id?.toString() === id ? order : o
      );
      const pendingOrders = newOrders.filter(
        (o) => o.status === "pending" || o.status === "processing"
      );

      return {
        orders: newOrders,
        pendingOrders,
      };
    }),

  deleteOrder: (id) =>
    set((state) => {
      const newOrders = state.orders.filter((o) => o._id?.toString() !== id);
      const pendingOrders = newOrders.filter(
        (o) => o.status === "pending" || o.status === "processing"
      );

      return {
        orders: newOrders,
        totalOrders: state.totalOrders - 1,
        pendingOrders,
      };
    }),

  setTotalOrders: (totalOrders) => set({ totalOrders }),

  // Glass Issue actions
  setGlassIssues: (glassIssues) => set({ glassIssues }),

  addGlassIssue: (issue) =>
    set((state) => ({
      glassIssues: [issue, ...state.glassIssues],
    })),

  // Common actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
