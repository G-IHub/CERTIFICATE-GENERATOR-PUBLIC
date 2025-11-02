import React, { useState, useEffect } from "react";
import TestimonialsSkeleton from "./skeletons/TestimonialsSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  MessageSquare,
  User,
  Calendar,
  Award,
  TrendingUp,
  Filter,
} from "lucide-react";
import { testimonialApi } from "../utils/api";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  certificateId: string;
  studentName: string;
  testimonial: string;
  courseName: string;
  organizationId: string;
  programId?: string;
  submittedAt: string;
}

interface TestimonialsViewProps {
  organizationId: string;
  accessToken: string | null;
}

const TestimonialsView: React.FC<TestimonialsViewProps> = ({
  organizationId,
  accessToken,
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsByCourse, setTestimonialsByCourse] = useState<
    Record<string, Testimonial[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    loadTestimonials();
  }, [organizationId, accessToken]);

  const loadTestimonials = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await testimonialApi.getForOrganization(
        accessToken,
        organizationId
      );
      setTestimonials(response.testimonials || []);
      setTestimonialsByCourse(response.testimonialsByCourse || {});
    } catch (error: any) {
      console.error("Failed to load testimonials:", error);
      toast.error("Failed to load testimonials");
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

  const courses = Object.keys(testimonialsByCourse);
  const displayedTestimonials =
    selectedCourse === "all"
      ? testimonials
      : testimonialsByCourse[selectedCourse] || [];

  if (loading) {
    return <TestimonialsSkeleton />;
  }

  if (testimonials.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Testimonials Yet
          </h3>
          <p className="text-gray-600 text-center max-w-md">
            When students submit their feedback along with their certificates,
            their testimonials will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Testimonials</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {testimonials.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Courses with Feedback</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {courses.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg per Course</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {courses.length > 0
                    ? (testimonials.length / courses.length).toFixed(1)
                    : "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter by Course
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCourse === "all" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCourse("all")}
            >
              All Courses ({testimonials.length})
            </Badge>
            {courses.map((course) => (
              <Badge
                key={course}
                variant={selectedCourse === course ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => setSelectedCourse(course)}
              >
                {course} ({testimonialsByCourse[course].length})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 gap-4">
        {displayedTestimonials.map((testimonial) => (
          <Card
            key={testimonial.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.studentName}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {testimonial.courseName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {formatDate(testimonial.submittedAt)}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-gray-700 italic">
                  "{testimonial.testimonial}"
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  ID: {testimonial.certificateId}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsView;
