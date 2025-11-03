import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSection,
  useCreateSection,
  useUpdateSection,
  useSections,
} from '@/hooks/use-sections';
import { useFreeCourse } from '@/hooks/use-free-courses';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreadcrumbNavigation } from '@/components/shared/breadcrumb-navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

const sectionSchema = z.object({
  title: z.object({
    en: z
      .string()
      .min(2, 'English title must be at least 2 characters')
      .max(200),
    ar: z.string().max(200).optional(),
    he: z.string().max(200).optional(),
  }),
  description: z.object({
    en: z.string().max(1000),
    ar: z.string().max(1000).optional(),
    he: z.string().max(1000).optional(),
  }).optional(),
  isVisible: z.boolean(),
  order: z.number().min(1).optional(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export default function CreateUpdateSection() {
  const { freeCourseId, sectionId } = useParams<{
    freeCourseId: string;
    sectionId?: string;
  }>();
  const navigate = useNavigate();
  const isEditMode = !!sectionId;

  const { data: freeCourse } = useFreeCourse(freeCourseId || '');
  const { data: section, isLoading: isLoadingSection } = useSection(
    freeCourseId || '',
    sectionId || '',
  );
  const { data: sections } = useSections(freeCourseId || '');

  const createMutation = useCreateSection(freeCourseId || '');
  const updateMutation = useUpdateSection(freeCourseId || '', sectionId || '');

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: { en: '', ar: '', he: '' },
      description: { en: '', ar: '', he: '' },
      isVisible: true,
      order: undefined,
    },
  });

  // Load existing section data in edit mode
  useEffect(() => {
    if (isEditMode && section) {
      form.reset({
        title: section.title,
        description: section.description || { en: '', ar: '', he: '' },
        isVisible: section.isVisible,
        order: section.order,
      });
    } else if (!isEditMode && sections) {
      // Auto-calculate order for new section
      const maxOrder = sections.reduce(
        (max, s) => Math.max(max, s.order || 0),
        0
      );
      form.setValue('order', maxOrder + 1);
    }
  }, [section, sections, isEditMode, form]);

  const onSubmit = async (data: SectionFormValues) => {
    try {
      if (isEditMode && sectionId) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate(`/dashboard/free-courses/${freeCourseId}/sections`);
    } catch (error) {
      console.error('Failed to save section:', error);
    }
  };

  const getDisplayName = (value: any) => {
    if (typeof value === 'string') return value;
    return value?.en || value?.name?.en || 'N/A';
  };

  if (isEditMode && isLoadingSection) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNavigation
        items={[
          { label: 'Free Courses', path: '/dashboard/free-courses' },
          {
            label: getDisplayName(freeCourse?.data?.name),
            path: `/dashboard/free-courses/${freeCourseId}/sections`,
          },
          { label: 'Sections', path: `/dashboard/free-courses/${freeCourseId}/sections` },
          { label: isEditMode ? 'Edit Section' : 'Create Section' },
        ]}
      />

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate(`/dashboard/free-courses/${freeCourseId}/sections`)
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Section' : 'Create Section'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Update section details'
              : 'Create a new section for this free course'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="title.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter section title in English"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Arabic)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter section title in Arabic"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title.he"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Hebrew)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter section title in Hebrew"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="description.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter section description in English"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Arabic)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter section description in Arabic"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description.he"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Hebrew)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter section description in Hebrew"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Position of this section in the course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Visibility</FormLabel>
                        <FormDescription>
                          Make this section visible to students
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(`/dashboard/free-courses/${freeCourseId}/sections`)
              }
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditMode ? (
                'Update Section'
              ) : (
                'Create Section'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
