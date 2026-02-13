import { Leaf } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Plant Pal" className="h-8 w-8" />
            <span className="font-semibold text-primary">Plant Pal</span>
          </div>

          <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
            <p>Supporting UN Sustainable Development Goals</p>
            <div className="flex gap-4">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                SDG 13: Climate Action
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                SDG 15: Life on Land
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Plant Pal
          </p>
        </div>
      </div>
    </footer>
  );
};
