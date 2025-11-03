import { Link, useParams } from "react-router-dom";
import { useContentItems } from "@/hooks/use-content-items";
import { useSection } from "@/hooks/use-sections";
import { useFreeCourse } from "@/hooks/use-free-courses";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Video, ClipboardList } from "lucide-react";
import { BreadcrumbNavigation } from "@/components/shared/breadcrumb-navigation";
import { ContentItemActionsDropdown } from "@/components/free-course/content-item-actions-dropdown";

export default function ContentItemsPage() {
  const { freeCourseId, sectionId } = useParams<{
    freeCourseId: string;
    sectionId: string;
  }>();
  const { hasPermission, hasAnyPermission } = useAuthStore();

  const canCreate = hasPermission("create_courses");
  const canUpdate = hasPermission("update_courses");
  const canView = hasAnyPermission([
    "read_courses",
    "create_courses",
    "update_courses",
  ]);

  const { data: freeCourse, isLoading: isCourseLoading } = useFreeCourse(
    freeCourseId || ""
  );
  const { data: section, isLoading: isSectionLoading } = useSection(
    freeCourseId || "",
    sectionId || ""
  );
  const { data: contentItems, isLoading: isContentLoading } = useContentItems(
    freeCourseId || "",
    sectionId || ""
  );

  const getDisplayName = (value: any) => {
    if (typeof value === "string") return value;
    return value?.en || value?.name?.en || "N/A";
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "quiz":
        return <ClipboardList className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getContentTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      file: "default",
      video: "secondary",
      quiz: "outline",
    };
    return (
      <Badge variant={variants[type] || "default"} className="capitalize">
        {type}
      </Badge>
    );
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          You don't have permission to view content items.
        </p>
      </div>
    );
  }

  const isLoading = isCourseLoading || isSectionLoading || isContentLoading;

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation
        items={[
          { label: "Free Courses", path: "/dashboard/free-courses" },
          {
            label: getDisplayName(freeCourse?.data?.name),
            path: `/dashboard/free-courses/${freeCourseId}/sections`,
          },
          {
            label: "Sections",
            path: `/dashboard/free-courses/${freeCourseId}/sections`,
          },
          { label: getDisplayName(section?.title) },
          { label: "Content" },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Items</h1>
          <p className="text-muted-foreground">
            Manage content for {getDisplayName(section?.title)}
          </p>
        </div>
        {canCreate && (
          <Link
            to={`/dashboard/free-courses/${freeCourseId}/sections/${sectionId}/content/create`}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">Loading content items...</p>
            </div>
          ) : !contentItems?.length ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <p className="text-muted-foreground">No content items found</p>
              {canCreate && (
                <Link
                  to={`/dashboard/free-courses/${freeCourseId}/sections/${sectionId}/content/create`}
                >
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Content Item
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentItems
                  
                  .map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContentTypeIcon(item.type)}
                          <span className="font-medium">
                            {getDisplayName(item.title)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getContentTypeBadge(item.type)}</TableCell>
                      <TableCell className="text-right">
                        {(canUpdate || hasPermission("delete_courses")) && (
                          <ContentItemActionsDropdown
                            freeCourseId={freeCourseId || ""}
                            sectionId={sectionId || ""}
                            contentId={item._id}
                            contentTitle={getDisplayName(item.title)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
