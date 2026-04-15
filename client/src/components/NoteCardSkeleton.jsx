export default function NoteCardSkeleton() {
  return (
    <div className="p-3 rounded-md space-y-2 animate-pulse">
      <div className="h-3.5 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  );
}