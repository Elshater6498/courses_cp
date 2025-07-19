import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { useCreateTopic, useUpdateTopic, useTopic } from "@/hooks/useTopics";
import type { CreateTopicInput, UpdateTopicInput, Topic } from "@/types/api";

// Form validation schema
const topicSchema = z.object({
  name: z.object({
    en: z.string().min(2, "English name must be at least 2 characters"),
    ar: z.string().optional(),
    he: z.string().optional(),
  }),
  topicsPrice: z.number().min(0, "Price must be at least 0"),
  discount: z.number().min(0).max(100, "Discount must be between 0 and 100"),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface TopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  topicId?: string; // If provided, we're editing; otherwise, creating
  onSuccess?: () => void;
}

export function TopicDialog({
  open,
  onOpenChange,
  courseId,
  topicId,
  onSuccess,
}: TopicDialogProps) {
  const { hasPermission } = useAuthStore();
  const [isActive, setIsActive] = useState(true);
  const isEditing = !!topicId;

  // Queries
  const { data: topicData, isLoading: isLoadingTopic } = useTopic(topicId!);

  // Mutations
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();

  // Form setup
  const form = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: {
        en: "",
        ar: "",
        he: "",
      },
      topicsPrice: 0,
      discount: 0,
    },
  });

  // Update form when topic data is loaded (for editing)
  useEffect(() => {
    if (isEditing && topicData?.data) {
      const topic = topicData.data;
      const name =
        typeof topic.name === "string"
          ? { en: topic.name, ar: "", he: "" }
          : topic.name;

      form.reset({
        name,
        topicsPrice: topic.topicsPrice,
        discount: topic.discount,
      });
      setIsActive(topic.isActive);
    }
  }, [topicData, form, isEditing]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset({
        name: { en: "", ar: "", he: "" },
        topicsPrice: 0,
        discount: 0,
      });
      setIsActive(true);
    }
  }, [open, form]);

  const onSubmit = async (data: TopicFormData) => {
    try {
      if (isEditing) {
        const updateData: UpdateTopicInput = {
          ...data,
          isActive,
        };
        await updateTopicMutation.mutateAsync({
          id: topicId!,
          data: updateData,
        });
        toast.success("Topic updated successfully!");
      } else {
        const createData: CreateTopicInput = {
          ...data,
          courseId,
        };
        await createTopicMutation.mutateAsync(createData);
        toast.success("Topic created successfully!");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} topic`
      );
    }
  };

  const canCreate = hasPermission("create_topics");
  const canUpdate = hasPermission("update_topics");

  if (isEditing && !canUpdate) {
    return null;
  }

  if (!isEditing && !canCreate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Topic" : "Create Topic"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the topic information below."
              : "Fill in the details for the new topic."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Topic Name */}
          <div className="space-y-2">
            <Label htmlFor="name-en">Topic Name (English) *</Label>
            <Input
              id="name-en"
              {...form.register("name.en")}
              placeholder="Enter topic name in English"
            />
            {form.formState.errors.name?.en && (
              <p className="text-sm text-red-500">
                {form.formState.errors.name.en.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name-ar">Topic Name (Arabic)</Label>
            <Input
              id="name-ar"
              {...form.register("name.ar")}
              placeholder="Enter topic name in Arabic"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name-he">Topic Name (Hebrew)</Label>
            <Input
              id="name-he"
              {...form.register("name.he")}
              placeholder="Enter topic name in Hebrew"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="topicsPrice">Price *</Label>
            <Input
              id="topicsPrice"
              type="number"
              step="0.01"
              min="0"
              {...form.register("topicsPrice", { valueAsNumber: true })}
              placeholder="Enter topic price"
            />
            {form.formState.errors.topicsPrice && (
              <p className="text-sm text-red-500">
                {form.formState.errors.topicsPrice.message}
              </p>
            )}
          </div>

          {/* Discount */}
          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              {...form.register("discount", { valueAsNumber: true })}
              placeholder="Enter discount percentage"
            />
            {form.formState.errors.discount && (
              <p className="text-sm text-red-500">
                {form.formState.errors.discount.message}
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createTopicMutation.isPending ||
                updateTopicMutation.isPending ||
                (isEditing && isLoadingTopic)
              }
            >
              {createTopicMutation.isPending ||
              updateTopicMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Topic"
              ) : (
                "Create Topic"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
