import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Course } from "@shared/schema";

export default function CoursePage() {
  const [, params] = useRoute("/course/:id");
  const { toast } = useToast();
  
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${params?.id}`]
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/courses/${params?.id}/enroll`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled!",
        description: "You have successfully enrolled in this course."
      });
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-64 bg-muted rounded mb-6" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <Badge variant={course.difficulty === "Beginner" ? "default" : "destructive"}>
            {course.difficulty}
          </Badge>
        </div>
        <p className="text-muted-foreground mb-4">{course.description}</p>
        <div 
          className="w-full h-64 rounded-lg bg-cover bg-center mb-6" 
          style={{ backgroundImage: `url(${course.imageUrl})` }}
        />
        <div className="flex items-center justify-between">
          <p>Duration: {course.duration} minutes</p>
          <Button 
            onClick={() => enrollMutation.mutate()}
            disabled={course.enrolled || enrollMutation.isPending}
          >
            {course.enrolled ? "Enrolled" : "Enroll Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
