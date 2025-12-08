import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Mail,
  User,
  Calendar,
  Download,
  Search,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface EmailData {
  email: string;
  studentName: string;
  courseName: string;
  organizationId: string;
  submittedAt: string;
}

interface AdminEmailsViewProps {
  accessToken: string | null;
}

const AdminEmailsView: React.FC<AdminEmailsViewProps> = ({ accessToken }) => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEmails();
  }, [accessToken]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const authHeader = accessToken ?? publicAnonKey;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/emails`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authHeader}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load email addresses");
      }

      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error: any) {
      console.error("Error loading emails:", error);
      toast.error("Failed to load email addresses");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadAsJSON = () => {
    try {
      const data = filteredEmails.map((item) => ({
        email: item.email,
        studentName: item.studentName,
        courseName: item.courseName,
        submittedAt: item.submittedAt,
        formattedDate: formatDate(item.submittedAt),
      }));

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `student_emails_${new Date().toISOString().split("T")[0]}.json`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Email addresses exported as JSON");
    } catch (error) {
      console.error("Failed to download JSON:", error);
      toast.error("Failed to download JSON");
    }
  };

  const downloadAsCSV = () => {
    try {
      const headers = [
        "Email",
        "Student Name",
        "Course Name",
        "Submitted Date",
      ];

      const rows = filteredEmails.map((item) => [
        item.email,
        item.studentName,
        item.courseName,
        formatDate(item.submittedAt),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `student_emails_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Email addresses exported as CSV");
    } catch (error) {
      console.error("Failed to download CSV:", error);
      toast.error("Failed to download CSV");
    }
  };

  const filteredEmails = emails.filter(
    (item) =>
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading email addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Email Addresses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {emails.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(emails.map((e) => e.email)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(emails.map((e) => e.courseName)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Student Email Addresses
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={downloadAsCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Download as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadAsJSON}>
                  <Download className="w-4 h-4 mr-2" />
                  Download as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by email, name, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Showing {filteredEmails.length} of {emails.length} email addresses
            </p>
          </div>

          {filteredEmails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? "No email addresses found matching your search"
                  : "No email addresses collected yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmails.map((item, index) => (
                <Card key={index} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {item.studentName}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {item.courseName}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {item.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.submittedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmailsView;