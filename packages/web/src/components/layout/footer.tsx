/**
 * Footer Component.
 *
 * Simple footer with branding and links.
 */

import { UtensilsCrossed } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold gradient-text">Eato</span>
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Eato. Smart restaurant ordering.
          </p>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
