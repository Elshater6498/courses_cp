import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, GripVertical, FileText, Video, ClipboardList } from 'lucide-react'
import type { Section, ContentItem, ContentItemType } from '@/types/api'

interface SectionBuilderProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
}

export function SectionBuilder({ sections, onChange }: SectionBuilderProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const addSection = () => {
    const newSection: Section = {
      _id: `temp-${Date.now()}`,
      title: { en: '' },
      description: { en: '' },
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

  const updateSectionTitle = (index: number, lang: 'en' | 'ar' | 'he', value: string) => {
    const updated = [...sections]
    updated[index] = {
      ...updated[index],
      title: { ...updated[index].title, [lang]: value },
    }
    onChange(updated)
  }

  const updateSectionDescription = (index: number, lang: 'en' | 'ar' | 'he', value: string) => {
    const updated = [...sections]
    updated[index] = {
      ...updated[index],
      description: { ...updated[index].description, [lang]: value },
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
      type: 'file' as ContentItemType,
      title: { en: '' },
      order: sections[sectionIndex].contentItems.length + 1,
    }
    const updated = [...sections]
    updated[sectionIndex].contentItems = [...updated[sectionIndex].contentItems, newContent]
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
    lang: 'en' | 'ar' | 'he',
    value: string
  ) => {
    const updated = [...sections]
    updated[sectionIndex].contentItems[contentIndex] = {
      ...updated[sectionIndex].contentItems[contentIndex],
      title: { ...updated[sectionIndex].contentItems[contentIndex].title, [lang]: value },
    }
    onChange(updated)
  }

  const deleteContentItem = (sectionIndex: number, contentIndex: number) => {
    const updated = [...sections]
    updated[sectionIndex].contentItems = updated[sectionIndex].contentItems.filter(
      (_, i) => i !== contentIndex
    )
    // Reorder remaining content items
    updated[sectionIndex].contentItems.forEach((item, i) => {
      item.order = i + 1
    })
    onChange(updated)
  }

  const getContentIcon = (type: ContentItemType) => {
    switch (type) {
      case 'file':
        return <FileText className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'quiz':
        return <ClipboardList className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Sections</h3>
          <p className="text-sm text-muted-foreground">
            Organize your course content into sections with various content types
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
        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
          {sections.map((section, sectionIndex) => (
            <AccordionItem key={section._id} value={section._id}>
              <Card>
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline">Section {section.order}</Badge>
                      <span className="font-medium">
                        {section.title.en || 'Untitled Section'}
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
                              updateSection(sectionIndex, 'isVisible', checked)
                            }
                          />
                          <Label htmlFor={`visible-${section._id}`}>Visible to students</Label>
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
                      <div>
                        <Label>Title (English) *</Label>
                        <Input
                          value={section.title.en}
                          onChange={(e) =>
                            updateSectionTitle(sectionIndex, 'en', e.target.value)
                          }
                          placeholder="Enter section title in English"
                        />
                      </div>

                      <div>
                        <Label>Title (Arabic)</Label>
                        <Input
                          value={section.title.ar || ''}
                          onChange={(e) =>
                            updateSectionTitle(sectionIndex, 'ar', e.target.value)
                          }
                          placeholder="Enter section title in Arabic"
                        />
                      </div>

                      <div>
                        <Label>Title (Hebrew)</Label>
                        <Input
                          value={section.title.he || ''}
                          onChange={(e) =>
                            updateSectionTitle(sectionIndex, 'he', e.target.value)
                          }
                          placeholder="Enter section title in Hebrew"
                        />
                      </div>

                      <div>
                        <Label>Description (English)</Label>
                        <Textarea
                          value={section.description?.en || ''}
                          onChange={(e) =>
                            updateSectionDescription(sectionIndex, 'en', e.target.value)
                          }
                          placeholder="Enter section description in English"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Description (Arabic)</Label>
                        <Textarea
                          value={section.description?.ar || ''}
                          onChange={(e) =>
                            updateSectionDescription(sectionIndex, 'ar', e.target.value)
                          }
                          placeholder="Enter section description in Arabic"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Description (Hebrew)</Label>
                        <Textarea
                          value={section.description?.he || ''}
                          onChange={(e) =>
                            updateSectionDescription(sectionIndex, 'he', e.target.value)
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
                                      onClick={() => deleteContentItem(sectionIndex, contentIndex)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid gap-3">
                                    <div>
                                      <Label>Content Type *</Label>
                                      <Select
                                        value={item.type}
                                        onValueChange={(value) =>
                                          updateContentItem(
                                            sectionIndex,
                                            contentIndex,
                                            'type',
                                            value as ContentItemType
                                          )
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="file">File</SelectItem>
                                          <SelectItem value="video">Video</SelectItem>
                                          <SelectItem value="quiz">Quiz</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label>Title (English) *</Label>
                                      <Input
                                        value={item.title.en}
                                        onChange={(e) =>
                                          updateContentTitle(
                                            sectionIndex,
                                            contentIndex,
                                            'en',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter content title in English"
                                      />
                                    </div>

                                    <div>
                                      <Label>Title (Arabic)</Label>
                                      <Input
                                        value={item.title.ar || ''}
                                        onChange={(e) =>
                                          updateContentTitle(
                                            sectionIndex,
                                            contentIndex,
                                            'ar',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter content title in Arabic"
                                      />
                                    </div>

                                    <div>
                                      <Label>Title (Hebrew)</Label>
                                      <Input
                                        value={item.title.he || ''}
                                        onChange={(e) =>
                                          updateContentTitle(
                                            sectionIndex,
                                            contentIndex,
                                            'he',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter content title in Hebrew"
                                      />
                                    </div>

                                    {item.type === 'video' && (
                                      <div>
                                        <Label>Video URL</Label>
                                        <Input
                                          value={item.url || ''}
                                          onChange={(e) =>
                                            updateContentItem(
                                              sectionIndex,
                                              contentIndex,
                                              'url',
                                              e.target.value
                                            )
                                          }
                                          placeholder="Enter video URL or leave empty to select from library"
                                        />
                                      </div>
                                    )}

                                    <div>
                                      <Label>Resource ID (optional)</Label>
                                      <Input
                                        value={item.resourceId || ''}
                                        onChange={(e) =>
                                          updateContentItem(
                                            sectionIndex,
                                            contentIndex,
                                            'resourceId',
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter resource ID (file/video/quiz)"
                                      />
                                      <p className="text-xs text-muted-foreground mt-1">
                                        ID of the file, video from library, or quiz
                                      </p>
                                    </div>
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
