
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save, FolderOpen } from 'lucide-react';

interface SheetManagerActionsProps {
  isAuthenticated: boolean;
  hasSheets: boolean;
  onNewSheet: () => void;
  onOpenSaveDialog: () => void;
  onOpenLoadDialog: () => void;
  onAuthClick: () => void;
}

const SheetManagerActions: React.FC<SheetManagerActionsProps> = ({
  isAuthenticated,
  hasSheets,
  onNewSheet,
  onOpenSaveDialog,
  onOpenLoadDialog,
  onAuthClick
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={onNewSheet}
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        New Sheet
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={onOpenSaveDialog}
        disabled={!isAuthenticated}
      >
        <Save className="h-4 w-4 mr-2" />
        Save Sheet
      </Button>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={onOpenLoadDialog}
        disabled={!isAuthenticated || !hasSheets}
      >
        <FolderOpen className="h-4 w-4 mr-2" />
        Open Sheet
      </Button>

      {!isAuthenticated && (
        <Button 
          variant="default" 
          size="sm" 
          className="w-full mt-2"
          onClick={onAuthClick}
        >
          Sign in to save sheets
        </Button>
      )}
    </div>
  );
};

export default SheetManagerActions;
