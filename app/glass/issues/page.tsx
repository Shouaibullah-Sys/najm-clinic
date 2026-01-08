// app/glass/issues/page.tsx
"use client";

import { useEffect, useState } from "react";
import { GlassIssue } from "@/types/glass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GlassIssuesPage() {
  const [issues, setIssues] = useState<GlassIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch("/api/glass/issues");
      if (response.ok) {
        const data = await response.json();
        setIssues(data);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(
    (issue) =>
      issue.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.issueNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.customerPhone.includes(searchTerm)
  );

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-red-100 text-red-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      scratch: "bg-blue-100 text-blue-800",
      breakage: "bg-red-100 text-red-800",
      "wrong-prescription": "bg-purple-100 text-purple-800",
      "frame-damage": "bg-orange-100 text-orange-800",
      "lens-popping": "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Glass Issues</h2>
          <p className="text-gray-500">Track and manage customer issues</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Issues List</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by customer name, issue number, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No issues found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">
                        {issue.issueNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {issue.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {issue.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(issue.type)}>
                          {issue.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPriorityBadgeColor(issue.priority)}
                        >
                          {issue.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {issue.description}
                      </TableCell>
                      <TableCell>{issue.assignedTo}</TableCell>
                      <TableCell>
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
