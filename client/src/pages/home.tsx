import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Search, Clock } from "lucide-react";
import { useState } from "react";
import type { Course, LiveSession } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<string>("all");

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", { title: searchQuery, ...(priceFilter !== "all" && { maxPrice: Number(priceFilter) }) }]
  });

  const { data: liveSessions, isLoading: sessionsLoading } = useQuery<LiveSession[]>({
    queryKey: ["/api/live-sessions"]
  });

  if (coursesLoading) {
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

  const filteredCourses = courses?.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (priceFilter === "all" || (course.price || 0) <= Number(priceFilter))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
            Explore the Universe of Learning
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover courses taught by expert instructors
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="25">Under $25</SelectItem>
              <SelectItem value="50">Under $50</SelectItem>
              <SelectItem value="100">Under $100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Live Sessions Section */}
        {liveSessions && liveSessions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Upcoming Live Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveSessions.map((session) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{session.title}</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.startTime).toLocaleString()}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={session.zoomLink} target="_blank" rel="noopener noreferrer">
                        Join Session
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <h2 className="text-3xl font-bold mb-6">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
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
                <p className="text-muted-foreground line-clamp-2">{course.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm">Duration: {course.duration} minutes</p>
                  {course.price && (
                    <p className="font-semibold">${course.price}</p>
                  )}
                </div>
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
    </div>
  );
}