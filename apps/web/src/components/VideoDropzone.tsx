import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@web/lib/utils';

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  isDragging?: boolean;
  onDragStateChange?: (dragging: boolean) => void;
}

export function VideoDropzone({
  onFileSelect,
  disabled = false,
  isDragging = false,
  onDragStateChange,
}: VideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    onDragStateChange?.(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (disabled) return;
    onDragStateChange?.(true);
  }

  function handleDragLeave() {
    onDragStateChange?.(false);
  }

  function handleClick() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-12 transition-colors',
        disabled && 'cursor-not-allowed opacity-50',
        isDragging && !disabled && 'border-primary bg-primary/5',
        !isDragging && !disabled && 'border-muted-foreground/25 hover:border-muted-foreground/50',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <Upload className="h-10 w-10 text-muted-foreground" />
      <p className="text-center text-sm text-muted-foreground">
        Drag your video here or click to select
      </p>
    </div>
  );
}
