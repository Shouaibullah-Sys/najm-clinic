// providers/GlassStoreProvider.tsx
"use client";

import { useEffect } from "react";
import { useGlassStore } from "@/store/glassStore";

export default function GlassStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setGlassStock = useGlassStore((state) => state.setGlassStock);
  const setOrders = useGlassStore((state) => state.setOrders);
  const setGlassIssues = useGlassStore((state) => state.setGlassIssues);
  const setLoading = useGlassStore((state) => state.setLoading);
  const setError = useGlassStore((state) => state.setError);

  useEffect(() => {
    const initializeGlassData = async () => {
      try {
        setLoading(true);

        // Fetch glass stock
        const stockResponse = await fetch("/api/glass/stock");
        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          setGlassStock(stockData);
        }

        // Fetch orders
        const ordersResponse = await fetch("/api/glass/orders");
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        }

        // Fetch glass issues
        const issuesResponse = await fetch("/api/glass/issues");
        if (issuesResponse.ok) {
          const issuesData = await issuesResponse.json();
          setGlassIssues(issuesData);
        }
      } catch (error) {
        console.error("Failed to initialize glass data:", error);
        setError("Failed to load glass data");
      } finally {
        setLoading(false);
      }
    };

    initializeGlassData();
  }, [setGlassStock, setOrders, setGlassIssues, setLoading, setError]);

  return <>{children}</>;
}
