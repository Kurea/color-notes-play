
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Json } from '@/integrations/supabase/types';

interface SaveSheetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  userId: string | undefined;
  onSaveSheet: (title: string) => void;
  onSheetSaved: () => void;
}

const SaveSheetDialog: React.FC<SaveSheetDialogProps> = ({
  isOpen,
  onOpenChange,
  notes,
  userId,
  onSaveSheet,
  onSheetSaved
}) => {
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveSheet = async () => {
    if (!userId) {
      toast.error('You must be logged in to save sheets');
      return;
    }

    if (!newSheetTitle.trim()) {
      toast.error('Please enter a title for your sheet');
      return;
    }

    if (notes.length === 0) {
      toast.error('Your sheet is empty. Add some notes first!');
      return;
    }

    setIsLoading(true);

    try {
      const sheetData = {
        title: newSheetTitle,
        notes: notes as unknown as Json,
        user_id: userId
      };

      const { data, error } = await supabase
        .from('music_sheets')
        .insert(sheetData)
        .select();

      if (error) {
        console.error('Error saving sheet:', error);
        toast.error('Failed to save your sheet');
        return;
      }

      toast.success('Sheet saved successfully!');
      onOpenChange(false);
      onSaveSheet(newSheetTitle);
      setNewSheetTitle('');
      onSheetSaved();
    } catch (error) {
      console.error('Error in handleSaveSheet:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Music Sheet</DialogTitle>
          <DialogDescription>
            Give your music sheet a name to save it to your collection.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            placeholder="Sheet title"
            value={newSheetTitle}
            onChange={(e) => setNewSheetTitle(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSaveSheet} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Sheet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveSheetDialog;
