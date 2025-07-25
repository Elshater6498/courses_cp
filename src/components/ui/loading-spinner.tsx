import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-300 border-t-blue-600",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}
