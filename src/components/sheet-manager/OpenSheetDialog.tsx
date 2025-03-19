
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/utils/musicTheory';

interface MusicSheet {
  id: string;
  title: string;
  notes: Note[];
  created_at: string;
}

interface OpenSheetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sheets: MusicSheet[];
  onLoadSheet: (sheet: MusicSheet) => void;
  onSheetsUpdated: () => void;
}

const OpenSheetDialog: React.FC<OpenSheetDialogProps> = ({
  isOpen,
  onOpenChange,
  sheets,
  onLoadSheet,
  onSheetsUpdated
}) => {
  const handleDeleteSheet = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this sheet?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('music_sheets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting sheet:', error);
        toast.error('Failed to delete sheet');
        return;
      }

      toast.success('Sheet deleted');
      onSheetsUpdated();
    } catch (error) {
      console.error('Error in handleDeleteSheet:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Open Music Sheet</DialogTitle>
          <DialogDescription>
            Select a sheet from your saved collection.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-2">
          {sheets.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              You don't have any saved sheets yet.
            </p>
          ) : (
            sheets.map((sheet) => (
              <div 
                key={sheet.id}
                className="p-3 border rounded-md hover:bg-secondary/50 cursor-pointer flex justify-between items-center"
                onClick={() => onLoadSheet(sheet)}
              >
                <div>
                  <h4 className="font-medium">{sheet.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sheet.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteSheet(sheet.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OpenSheetDialog;
