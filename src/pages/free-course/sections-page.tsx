import { Link, useParams } from 'react-router-dom';
import { useSections } from '@/hooks/use-sections';
import { useFreeCourse } from '@/hooks/use-free-courses';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { BreadcrumbNavigation } from '@/components/shared/breadcrumb-navigation';
import { SectionActionsDropdown } from '@/components/free-course/section-actions-dropdown';

export default function SectionsPage() {
  const { freeCourseId } = useParams<{ freeCourseId: string }>();
  const { hasPermission, hasAnyPermission } = useAuthStore();

  const canCreate = hasPermission('create_courses');
  const canUpdate = hasPermission('update_courses');
  const canView = hasAnyPermission([
    'read_courses',
    'create_courses',
    'update_courses',
  ]);

  const { data: freeCourse, isLoading: isCourseLoading } = useFreeCourse(
    freeCourseId || ''
  );
  const { data: sections, isLoading: isSectionsLoading } = useSections(
    freeCourseId || ''
  );

  const getDisplayName = (value: any) => {
    if (typeof value === 'string') return value;
    return value?.en || value?.name?.en || 'N/A';
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          You don't have permission to view sections.
        </p>
      </div>
    );
  }

  const isLoading = isCourseLoading || isSectionsLoading;

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation
        items={[
          { label: 'Free Courses', path: '/dashboard/free-courses' },
          { label: getDisplayName(freeCourse?.data?.name) },
          { label: 'Sections' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sections</h1>
          <p className="text-muted-foreground">
            Manage sections for {getDisplayName(freeCourse?.data?.name)}
          </p>
        </div>
        {canCreate && (
          <Link
            to={`/dashboard/free-courses/${freeCourseId}/sections/create`}
          >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Section
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">Loading sections...</p>
            </div>
          ) : !sections?.length ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <p className="text-muted-foreground">No sections found</p>
              {canCreate && (
                <Link
                  to={`/dashboard/free-courses/${freeCourseId}/sections/create`}
                >
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Section
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Content Items</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections
                  
                  .map((section) => (
                    <TableRow key={section._id}>
                      <TableCell className="font-medium">
                        {getDisplayName(section.title)}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {getDisplayName(section.description) || '-'}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/dashboard/free-courses/${freeCourseId}/sections/${section._id}/content`}
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Content ({section.contentItems?.length || 0})
                          </Button>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={section.isVisible ? 'default' : 'secondary'}
                        >
                          {section.isVisible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {(canUpdate || hasPermission('delete_courses')) && (
                          <SectionActionsDropdown
                            freeCourseId={freeCourseId || ''}
                            sectionId={section._id}
                            sectionName={getDisplayName(section.title)}
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
