/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Video,
  ClipboardList,
  X,
} from "lucide-react"
import type { Section, ContentItem, ContentItemType } from "@/types/api"
import { useVideosForSelect } from "@/hooks/use-videos-library"
import { UploadService, type UploadProgress } from "@/services/upload-service"
import { UploadProgressCard } from "@/components/ui/upload-progress"
import { toast } from "sonner"

interface SectionBuilderProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
}

export function SectionBuilder({ sections, onChange }: SectionBuilderProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Video library query
  const { data: videosData } = useVideosForSelect("lesson")

  // File upload state tracking per content item
  const [uploadingFiles, setUploadingFiles] = useState<
    Record<
      string,
      {
        file: File
        progress: UploadProgress | null
        status: "idle" | "uploading" | "completed" | "error"
        error: string | null
      }
    >
  >({})

  const addSection = () => {
    const newSection: Section = {
      _id: `temp-${Date.now()}`,
      title: { en: "" },
      description: { en: "" },
      order: sections.length + 1,
      isVisible: true,
      contentItems: [],
    }
    onChange([...sections, newSection])
    setExpandedSections([...expandedSections, newSection._id])
  }

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const updateSectionTitle = (
    index: number,
    lang: "en" | "ar" | "he",
    value: string
  ) => {
    const updated = [...sections]
    updated[index] = {
      ...updated[index],
      title: { ...updated[index].title, [lang]: value },
    }
    onChange(updated)
  }

  const updateSectionDescription = (
    index: number,
    lang: "en" | "ar" | "he",
    value: string
  ) => {
    const updated = [...sections]
    const currentDescription = updated[index].description || { en: "" }
    updated[index] = {
      ...updated[index],
      description: { ...currentDescription, [lang]: value },
    }
    onChange(updated)
  }

  const deleteSection = (index: number) => {
    const updated = sections.filter((_, i) => i !== index)
    // Reorder remaining sections
    updated.forEach((section, i) => {
      section.order = i + 1
    })
    onChange(updated)
  }

  const addContentItem = (sectionIndex: number) => {
    const newContent: ContentItem = {
      _id: `temp-content-${Date.now()}`,
      type: "file" as ContentItemType,
      title: { en: "" },
      order: sections[sectionIndex].contentItems.length + 1,
    }
    const updated = [...sections]
    updated[sectionIndex].contentItems = [
      ...updated[sectionIndex].contentItems,
      newContent,
    ]
    onChange(updated)
  }

  const updateContentItem = (
    sectionIndex: number,
    contentIndex: number,
    field: keyof ContentItem,
    value: any
  ) => {
    const updated = [...sections]
    updated[sectionIndex].contentItems[contentIndex] = {
      ...updated[sectionIndex].contentItems[contentIndex],
      [field]: value,
    }
    onChange(updated)
  }

  const updateContentTitle = (
    sectionIndex: number,
    contentIndex: number,
    lang: "en" | "ar" | "he",
    value: string
  ) => {
    const updated = [...sections]
    updated[sectionIndex].contentItems[contentIndex] = {
      ...updated[sectionIndex].contentItems[contentIndex],
      title: {
        ...updated[sectionIndex].contentItems[contentIndex].title,
        [lang]: value,
      },
    }
    onChange(updated)
  }

  const deleteContentItem = (sectionIndex: number, contentIndex: number) => {
    const updated = [...sections]
    const itemId = updated[sectionIndex].contentItems[contentIndex]._id

    // Clean up upload state if exists
    if (uploadingFiles[itemId]) {
      const newUploadingFiles = { ...uploadingFiles }
      delete newUploadingFiles[itemId]
      setUploadingFiles(newUploadingFiles)
    }

    updated[sectionIndex].contentItems = updated[
      sectionIndex
    ].contentItems.filter((_, i) => i !== contentIndex)
    // Reorder remaining content items
    updated[sectionIndex].contentItems.forEach((item, i) => {
      item.order = i + 1
    })
    onChange(updated)
  }

  const handleFileSelect = async (
    sectionIndex: number,
    contentIndex: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const itemId = sections[sectionIndex].contentItems[contentIndex]._id

    // Initialize upload state
    setUploadingFiles((prev) => ({
      ...prev,
      [itemId]: {
        file,
        progress: null,
        status: "idle",
        error: null,
      },
    }))

    try {
      // Update status to uploading
      setUploadingFiles((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], status: "uploading" },
      }))

      // Upload file
      const uploadType = UploadService.getUploadType(file.type)
      const result = await UploadService.uploadFileWithProgress(
        file,
        uploadType,
        "free-courses-content",
        (progress) => {
          setUploadingFiles((prev) => ({
            ...prev,
            [itemId]: { ...prev[itemId], progress },
          }))
        }
      )

      // Update content item with uploaded file URL
      updateContentItem(sectionIndex, contentIndex, "resourceId", result.key)

      // Update status to completed
      setUploadingFiles((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], status: "completed" },
      }))

      toast.success("File uploaded successfully")
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "File upload failed"
      setUploadingFiles((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          status: "error",
          error: errorMessage,
        },
      }))
      toast.error(errorMessage)
    }
  }

  const handleVideoSelect = (
    sectionIndex: number,
    contentIndex: number,
    videoId: string
  ) => {
    const selectedVideo = videosData?.data?.find(
      (video) => video.id === videoId
    )
    if (selectedVideo) {
      // Update both url and resourceId
      updateContentItem(
        sectionIndex,
        contentIndex,
        "url",
        selectedVideo.videoUrl
      )
      updateContentItem(sectionIndex, contentIndex, "resourceId", videoId)
    }
  }

  const getContentIcon = (type: ContentItemType) => {
    switch (type) {
      case "file":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "quiz":
        return <ClipboardList className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Sections</h3>
          <p className="text-sm text-muted-foreground">
            Organize your course content into sections with various content
            types
          </p>
        </div>
        <Button type="button" onClick={addSection} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No sections added yet</p>
            <Button type="button" onClick={addSection}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Section
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion
          type="multiple"
          value={expandedSections}
          onValueChange={setExpandedSections}
        >
          {sections.map((section, sectionIndex) => (
            <AccordionItem key={section._id} value={section._id}>
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline">Section {section.order}</Badge>
                      <span className="font-medium">
                        {section.title.en || "Untitled Section"}
                      </span>
                      <Badge variant="secondary" className="ml-auto">
                        {section.contentItems.length} items
                      </Badge>
                      {!section.isVisible && (
                        <Badge variant="destructive">Hidden</Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`visible-${section._id}`}
                            checked={section.isVisible}
                            onCheckedChange={(checked) =>
                              updateSection(sectionIndex, "isVisible", checked)
                            }
                          />
                          <Label htmlFor={`visible-${section._id}`}>
                            Visible to students
                          </Label>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSection(sectionIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>Title (English) *</Label>
                        <Input
                          value={section.title.en}
                          onChange={(e) =>
                            updateSectionTitle(
                              sectionIndex,
                              "en",
                              e.target.value
                            )
                          }
                          placeholder="Enter section title in English"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Title (Arabic)</Label>
                        <Input
                          value={section.title.ar || ""}
                          onChange={(e) =>
                            updateSectionTitle(
                              sectionIndex,
                              "ar",
                              e.target.value
                            )
                          }
                          placeholder="Enter section title in Arabic"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Title (Hebrew)</Label>
                        <Input
                          value={section.title.he || ""}
                          onChange={(e) =>
                            updateSectionTitle(
                              sectionIndex,
                              "he",
                              e.target.value
                            )
                          }
                          placeholder="Enter section title in Hebrew"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Description (English)</Label>
                        <Textarea
                          value={section.description?.en || ""}
                          onChange={(e) =>
                            updateSectionDescription(
                              sectionIndex,
                              "en",
                              e.target.value
                            )
                          }
                          placeholder="Enter section description in English"
                          rows={3}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Description (Arabic)</Label>
                        <Textarea
                          value={section.description?.ar || ""}
                          onChange={(e) =>
                            updateSectionDescription(
                              sectionIndex,
                              "ar",
                              e.target.value
                            )
                          }
                          placeholder="Enter section description in Arabic"
                          rows={3}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Description (Hebrew)</Label>
                        <Textarea
                          value={section.description?.he || ""}
                          onChange={(e) =>
                            updateSectionDescription(
                              sectionIndex,
                              "he",
                              e.target.value
                            )
                          }
                          placeholder="Enter section description in Hebrew"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Content Items</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addContentItem(sectionIndex)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Content
                        </Button>
                      </div>

                      {section.contentItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No content items added yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {section.contentItems.map((item, contentIndex) => (
                            <Card key={item._id}>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {getContentIcon(item.type)}
                                      <Badge variant="outline">
                                        Item {item.order}
                                      </Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        deleteContentItem(
                                          sectionIndex,
                                          contentIndex
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid gap-3">
                                    <div className="flex flex-col gap-2">
                                      <Label>Content Type *</Label>
                                      <Select
                                        value={item.type}
                                        onValueChange={(value) =>
                                          updateContentItem(
                                            sectionIndex,
                                            contentIndex,
                                            "type",
                                            value as ContentItemType
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="file">
                                            File
                                          </SelectItem>
                                          <SelectItem value="video">
                                            Video
                                          </SelectItem>
                                          <SelectItem value="quiz">
                                            Quiz
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label>Title (English) *</Label>
                                      <Input
                                        value={item.title.en}
                                        onChange={(e) =>
                                          updateContentTitle(
                                            sectionIndex,
                                            contentIndex,
                                            "en",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter content title in English"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label>Title (Arabic)</Label>
                                      <Input
                                        value={item.title.ar || ""}
                                        onChange={(e) =>
                                          updateContentTitle(
                                            sectionIndex,
                                            contentIndex,
                                            "ar",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter content title in Arabic"
                                      />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                      <Label>Title (Hebrew)</Label>
                                      <Input
                                        value={item.title.he || ""}
                                        onChange={(e) =>
                                          updateContentTitle(
                                            sectionIndex,
                                            contentIndex,
                                            "he",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter content title in Hebrew"
                                      />
                                    </div>

                                    {item.type === "video" && (
                                      <div className="flex flex-col gap-2">
                                        <Label>
                                          Select Video from Library *
                                        </Label>
                                        <Select
                                          value={item.resourceId || ""}
                                          onValueChange={(value) =>
                                            handleVideoSelect(
                                              sectionIndex,
                                              contentIndex,
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a video from library" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {videosData?.data?.map((video) => (
                                              <SelectItem
                                                key={video.id}
                                                value={video.id}
                                              >
                                                {video.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                        {item.resourceId && (
                                          <p className="text-xs text-muted-foreground">
                                            Selected:{" "}
                                            {
                                              videosData?.data?.find(
                                                (v) => v.id === item.resourceId
                                              )?.name
                                            }
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {item.type === "file" && (
                                      <div className="flex flex-col gap-2">
                                        <Label>Upload File *</Label>
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-3">
                                            <Input
                                              type="file"
                                              accept="*/*"
                                              onChange={(e) =>
                                                handleFileSelect(
                                                  sectionIndex,
                                                  contentIndex,
                                                  e
                                                )
                                              }
                                              className="flex-1"
                                            />
                                            {uploadingFiles[item._id]?.file && (
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                  const newUploadingFiles = {
                                                    ...uploadingFiles,
                                                  }
                                                  delete newUploadingFiles[
                                                    item._id
                                                  ]
                                                  setUploadingFiles(
                                                    newUploadingFiles
                                                  )
                                                }}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>

                                          {uploadingFiles[item._id]?.file && (
                                            <div className="text-sm text-gray-600">
                                              Selected:{" "}
                                              {
                                                uploadingFiles[item._id].file
                                                  .name
                                              }{" "}
                                              (
                                              {UploadService.formatBytes(
                                                uploadingFiles[item._id].file
                                                  .size
                                              )}
                                              )
                                            </div>
                                          )}

                                          {uploadingFiles[item._id]?.status ===
                                            "uploading" &&
                                            uploadingFiles[item._id]
                                              .progress && (
                                              <UploadProgressCard
                                                progress={
                                                  uploadingFiles[item._id]
                                                    .progress!
                                                }
                                                fileName={
                                                  uploadingFiles[item._id].file
                                                    .name
                                                }
                                                status="uploading"
                                              />
                                            )}

                                          {uploadingFiles[item._id]?.status ===
                                            "completed" && (
                                            <UploadProgressCard
                                              progress={
                                                uploadingFiles[item._id]
                                                  .progress!
                                              }
                                              fileName={
                                                uploadingFiles[item._id].file
                                                  .name
                                              }
                                              status="completed"
                                            />
                                          )}

                                          {uploadingFiles[item._id]?.status ===
                                            "error" && (
                                            <UploadProgressCard
                                              progress={
                                                uploadingFiles[item._id]
                                                  .progress!
                                              }
                                              fileName={
                                                uploadingFiles[item._id].file
                                                  .name
                                              }
                                              status="error"
                                              error={
                                                uploadingFiles[item._id].error
                                              }
                                            />
                                          )}

                                          {item.resourceId && (
                                            <p className="text-xs text-green-600">
                                              ✓ File uploaded successfully
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
