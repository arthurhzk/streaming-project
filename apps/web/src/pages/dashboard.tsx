import { Link } from 'react-router-dom';
import { Button } from '@web/components/ui/button';
import { Upload } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome to your streaming platform.</p>
        <Button asChild className="mt-4">
          <Link to="/upload">
            <Upload className="h-4 w-4" />
            Upload Video
          </Link>
        </Button>
      </div>
    </div>
  );
}
