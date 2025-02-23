import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Course } from "@shared/schema";

export default function Home() {
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"]
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Space Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card key={course.id}>
            <div 
              className="h-48 bg-cover bg-center rounded-t-lg" 
              style={{ backgroundImage: `url(${course.imageUrl})` }}
            />
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{course.title}</h2>
                <Badge variant={course.difficulty === "Beginner" ? "default" : "destructive"}>
                  {course.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{course.description}</p>
              <p className="mt-2 text-sm">Duration: {course.duration} minutes</p>
            </CardContent>
            <CardFooter>
              <Link href={`/course/${course.id}`}>
                <Button className="w-full">View Course</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
