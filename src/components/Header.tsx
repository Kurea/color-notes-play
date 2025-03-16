
import React from 'react';
import { Music } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-2">
        <Music className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-medium tracking-tight">Chromatic</h1>
        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">Beta</span>
      </div>
      
      <nav className="flex items-center gap-6">
        <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          New Sheet
        </button>
        <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Examples
        </button>
        <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Help
        </button>
      </nav>
    </header>
  );
};

export default Header;
