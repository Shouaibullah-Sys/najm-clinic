"use client";

import { useEffect, useState } from "react";

interface IssueItem {
  id: string;
  issuanceNumber: string;
  orderNumber: string;
  issuedQuantity: number;
  issuedTo: string;
  status: "issued" | "returned" | "damaged";
  issuedAt: string;
  stockItemId?: {
    productName: string;
    glassType: string;
  };
}

export default function GlassIssuesPage() {
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch("/api/glass/issues");
        if (!response.ok) {
          throw new Error("Failed to fetch issues");
        }
        const data = await response.json();
        setIssues(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Glass Issues</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Glass Issues</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Glass Issues</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left">Issuance #</th>
              <th className="px-4 py-2 border-b text-left">Order #</th>
              <th className="px-4 py-2 border-b text-left">Product</th>
              <th className="px-4 py-2 border-b text-left">Quantity</th>
              <th className="px-4 py-2 border-b text-left">Issued To</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{issue.issuanceNumber}</td>
                <td className="px-4 py-2 border-b">{issue.orderNumber}</td>
                <td className="px-4 py-2 border-b">
                  {issue.stockItemId?.productName || "N/A"} (
                  {issue.stockItemId?.glassType})
                </td>
                <td className="px-4 py-2 border-b">{issue.issuedQuantity}</td>
                <td className="px-4 py-2 border-b">{issue.issuedTo}</td>
                <td className="px-4 py-2 border-b">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      issue.status === "issued"
                        ? "bg-green-100 text-green-800"
                        : issue.status === "returned"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {issue.status}
                  </span>
                </td>
                <td className="px-4 py-2 border-b">
                  {new Date(issue.issuedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {issues.length === 0 && (
          <p className="p-4 text-center text-gray-500">No issues found</p>
        )}
      </div>
    </div>
  );
}
