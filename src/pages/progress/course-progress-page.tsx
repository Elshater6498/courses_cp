import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Target, Clock, TrendingUp, Trophy } from "lucide-react";
import { useCourseStatistics } from "@/hooks/use-progress";
import { useCourse } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function CourseProgressPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { data: courseData, isLoading: courseLoading } = useCourse(courseId!);
  const { data: statisticsData, isLoading: statsLoading } = useCourseStatistics(courseId!);

  const course = courseData?.data;
  const statistics = statisticsData?.data;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const getCourseName = (courseName: any): string => {
    if (typeof courseName === "string") return courseName;
    return courseName?.en || courseName?.ar || courseName?.he || "Untitled Course";
  };

  if (courseLoading || statsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/courses")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {course ? getCourseName(course.name) : "Course Progress"}
        </h1>
        <p className="text-gray-500 mt-1">
          Track student progress and course completion statistics
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold mt-1">{statistics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold mt-1">
                  {statistics.completionRate.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={statistics.completionRate} className="mt-2" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Completion</p>
                <p className="text-2xl font-bold mt-1">
                  {statistics.averageCompletion.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={statistics.averageCompletion} className="mt-2" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Time Spent</p>
                <p className="text-2xl font-bold mt-1">
                  {formatTime(statistics.averageTimeSpent)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Additional Stats */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">User Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <Badge variant="default">{statistics.completedUsers} users</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <Badge variant="secondary">{statistics.inProgressUsers} users</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Time Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Time Spent</span>
                <span className="font-medium">{formatTime(statistics.totalTimeSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average per User</span>
                <span className="font-medium">{formatTime(statistics.averageTimeSpent)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Leaderboard Button */}
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <Trophy className="h-12 w-12 text-yellow-500" />
          <div>
            <h3 className="text-lg font-semibold mb-2">View Individual Rankings</h3>
            <p className="text-gray-500 mb-4">
              See the leaderboard to view top performers and individual student progress details
            </p>
          </div>
          <Button
            onClick={() => navigate(`/dashboard/courses/${courseId}/leaderboard`)}
            size="lg"
          >
            <Trophy className="h-4 w-4 mr-2" />
            View Leaderboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
