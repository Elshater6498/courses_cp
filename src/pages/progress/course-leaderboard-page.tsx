import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { useCourseLeaderboard } from "@/hooks/use-progress";
import { useCourse } from "@/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function CourseLeaderboardPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);

  const { data: courseData, isLoading: courseLoading } = useCourse(courseId!);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useCourseLeaderboard(
    courseId!,
    limit
  );

  const course = courseData?.data;
  const leaderboard = leaderboardData?.data || [];

  const getCourseName = (courseName: any): string => {
    if (typeof courseName === "string") return courseName;
    return courseName?.en || courseName?.ar || courseName?.he || "Untitled Course";
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300";
      case 3:
        return "bg-orange-100 text-orange-800 border-orange-300";
      default:
        return "";
    }
  };

  if (courseLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
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
          onClick={() => navigate(`/dashboard/courses/${courseId}/progress`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Progress
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {course ? getCourseName(course.name) : "Course"} Leaderboard
          </h1>
          <p className="text-gray-500 mt-1">
            Top performers ranked by completion percentage and time spent
          </p>
        </div>

        <Select
          value={limit.toString()}
          onValueChange={(value) => setLimit(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="25">Top 25</SelectItem>
            <SelectItem value="50">Top 50</SelectItem>
            <SelectItem value="100">Top 100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          <Card className={`p-6 text-center ${getRankBadge(2)} border-2`}>
            <div className="flex justify-center mb-2">
              {getRankIcon(2)}
            </div>
            <p className="font-semibold text-lg">{leaderboard[1].user.fullName}</p>
            <p className="text-sm text-gray-600">{leaderboard[1].user.email}</p>
            <div className="mt-3">
              <Progress value={leaderboard[1].completionPercentage} className="mb-2" />
              <p className="text-2xl font-bold">{leaderboard[1].completionPercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">
                {leaderboard[1].completedLessons} / {leaderboard[1].totalLessons} lessons
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {leaderboard[1].totalTimeSpentFormatted}
              </p>
            </div>
          </Card>

          {/* 1st Place */}
          <Card className={`p-6 text-center ${getRankBadge(1)} border-2 transform scale-105 shadow-lg`}>
            <div className="flex justify-center mb-2">
              {getRankIcon(1)}
            </div>
            <p className="font-semibold text-lg">{leaderboard[0].user.fullName}</p>
            <p className="text-sm text-gray-600">{leaderboard[0].user.email}</p>
            <div className="mt-3">
              <Progress value={leaderboard[0].completionPercentage} className="mb-2" />
              <p className="text-3xl font-bold">{leaderboard[0].completionPercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">
                {leaderboard[0].completedLessons} / {leaderboard[0].totalLessons} lessons
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {leaderboard[0].totalTimeSpentFormatted}
              </p>
            </div>
            {leaderboard[0].isCourseCompleted && (
              <Badge variant="default" className="mt-2">Completed</Badge>
            )}
          </Card>

          {/* 3rd Place */}
          <Card className={`p-6 text-center ${getRankBadge(3)} border-2`}>
            <div className="flex justify-center mb-2">
              {getRankIcon(3)}
            </div>
            <p className="font-semibold text-lg">{leaderboard[2].user.fullName}</p>
            <p className="text-sm text-gray-600">{leaderboard[2].user.email}</p>
            <div className="mt-3">
              <Progress value={leaderboard[2].completionPercentage} className="mb-2" />
              <p className="text-2xl font-bold">{leaderboard[2].completionPercentage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">
                {leaderboard[2].completedLessons} / {leaderboard[2].totalLessons} lessons
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {leaderboard[2].totalTimeSpentFormatted}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead>Time Spent</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : leaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No leaderboard data available
                </TableCell>
              </TableRow>
            ) : (
              leaderboard.map((entry) => (
                <TableRow
                  key={entry.user._id}
                  className={entry.rank <= 3 ? getRankBadge(entry.rank) : ""}
                >
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.user.fullName}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {entry.user.email}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">
                          {entry.completionPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={entry.completionPercentage} className="w-32" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{entry.completedLessons}</span>
                    <span className="text-gray-500"> / {entry.totalLessons}</span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.totalTimeSpentFormatted}
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.isCourseCompleted ? "default" : "secondary"}>
                      {entry.isCourseCompleted ? "Completed" : "In Progress"}
                    </Badge>
                    {entry.completedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
