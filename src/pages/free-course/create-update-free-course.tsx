import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useFreeCourse,
  useCreateFreeCourse,
  useUpdateFreeCourse,
} from '@/hooks/use-free-courses'
import { useUniversities } from '@/hooks/use-universities'
import { useFaculties } from '@/hooks/use-faculties'
import { useAdmins } from '@/hooks/use-admins'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionBuilder } from '@/components/free-course/section-builder'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { Section, University, Faculty, Admin } from '@/types/api'

const freeCourseSchema = z.object({
  name: z.object({
    en: z.string().min(2, 'English name must be at least 2 characters').max(200),
    ar: z.string().max(200).optional(),
    he: z.string().max(200).optional(),
  }),
  overview: z.object({
    en: z.string().min(10, 'English overview must be at least 10 characters').max(2000),
    ar: z.string().max(2000).optional(),
    he: z.string().max(2000).optional(),
  }),
  universityId: z.string().min(1, 'University is required'),
  facultyId: z.string().min(1, 'Faculty is required'),
  instructorId: z.string().min(1, 'Instructor is required'),
  imageUrl: z.string().url('Must be a valid URL').min(1, 'Image URL is required'),
  sections: z.array(z.any()).optional(),
})

type FreeCourseFormValues = z.infer<typeof freeCourseSchema>

export default function CreateUpdateFreeCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [sections, setSections] = useState<Section[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<string>('')

  const { data: freeCourseData, isLoading: isLoadingFreeCourse } = useFreeCourse(id || '')
  const { data: universitiesData } = useUniversities({ isActive: true })
  const { data: facultiesData } = useFaculties({
    universityId: selectedUniversity,
    isActive: true,
  })
  const { data: adminsData } = useAdmins({ isActive: true })

  const createMutation = useCreateFreeCourse()
  const updateMutation = useUpdateFreeCourse()

  const form = useForm<FreeCourseFormValues>({
    resolver: zodResolver(freeCourseSchema),
    defaultValues: {
      name: { en: '', ar: '', he: '' },
      overview: { en: '', ar: '', he: '' },
      universityId: '',
      facultyId: '',
      instructorId: '',
      imageUrl: '',
      sections: [],
    },
  })

  // Load existing free course data in edit mode
  useEffect(() => {
    if (isEditMode && freeCourseData?.data) {
      const course = freeCourseData.data
      const nameObj = typeof course.name === 'string' ? { en: course.name } : course.name
      const overviewObj =
        typeof course.overview === 'string' ? { en: course.overview } : course.overview

      form.reset({
        name: nameObj,
        overview: overviewObj,
        universityId:
          typeof course.universityId === 'string'
            ? course.universityId
            : course.universityId._id,
        facultyId:
          typeof course.facultyId === 'string' ? course.facultyId : course.facultyId._id,
        instructorId:
          typeof course.instructorId === 'string'
            ? course.instructorId
            : course.instructorId._id,
        imageUrl: course.imageUrl,
      })

      setSelectedUniversity(
        typeof course.universityId === 'string'
          ? course.universityId
          : course.universityId._id
      )
      setSections(course.sections || [])
    }
  }, [freeCourseData, isEditMode, form])

  const onSubmit = async (data: FreeCourseFormValues) => {
    try {
      const payload = {
        ...data,
        sections,
      }

      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }

      navigate('/dashboard/free-courses')
    } catch (error) {
      console.error('Failed to save free course:', error)
    }
  }

  const getDisplayName = (value: any) => {
    if (typeof value === 'string') return value
    return value?.en || value?.name?.en || 'N/A'
  }

  if (isEditMode && isLoadingFreeCourse) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/free-courses')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Free Course' : 'Create Free Course'}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode
              ? 'Update the free course details and sections'
              : 'Create a new university-specific free course'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="universityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedUniversity(value)
                          form.setValue('facultyId', '') // Reset faculty when university changes
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select university" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {universitiesData?.data?.items?.map((university) => (
                            <SelectItem key={university._id} value={university._id}>
                              {getDisplayName(university.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facultyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedUniversity}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select faculty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {facultiesData?.data?.items?.map((faculty) => (
                            <SelectItem key={faculty._id} value={faculty._id}>
                              {getDisplayName(faculty.name)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a university first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {adminsData?.data?.items?.map((admin) => (
                            <SelectItem key={admin._id} value={admin._id}>
                              {admin.userName} ({admin.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name (English) *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course name in English" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name (Arabic)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course name in Arabic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name.he"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name (Hebrew)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course name in Hebrew" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="overview.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overview (English) *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter course overview in English"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overview.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overview (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter course overview in Arabic"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overview.he"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overview (Hebrew)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter course overview in Hebrew"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <SectionBuilder sections={sections} onChange={setSections} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/free-courses')}
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
                'Update Free Course'
              ) : (
                'Create Free Course'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
