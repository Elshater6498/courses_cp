import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Clock, HardDrive, CheckCircle, XCircle } from "lucide-react";
import type { UploadProgress } from "@/services/uploadService";

interface UploadProgressProps {
  progress: UploadProgress;
  fileName: string;
  fileSize: number;
  status: "uploading" | "completed" | "error";
  error?: string | null;
}

export function UploadProgressCard({
  progress,
  fileName,
  fileSize,
  status,
  error,
}: UploadProgressProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case "uploading":
        return <Upload className="h-4 w-4 animate-pulse" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "uploading":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {status === "uploading" && "Uploading..."}
              {status === "completed" && "Upload Complete"}
              {status === "error" && "Upload Failed"}
            </span>
          </div>
          <span className="text-sm text-gray-500">{progress?.percentage}%</span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{fileName}</span>
            <span>
              {formatBytes(progress?.uploadedBytes || 0)} /{" "}
              {formatBytes(progress?.totalBytes || 0)}
            </span>
          </div>
          <Progress value={progress?.percentage || 0} className="h-2" />
        </div>

        {status === "uploading" && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <HardDrive className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">Speed:</span>
              <span className="font-medium">
                {formatSpeed(progress?.speed || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">ETA:</span>
              <span className="font-medium">
                {formatTime(progress?.estimatedTimeRemaining || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">Elapsed:</span>
              <span className="font-medium">
                {formatTime((Date.now() - (progress?.startTime || 0)) / 1000)}
              </span>
            </div>
          </div>
        )}

        {status === "error" && error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
