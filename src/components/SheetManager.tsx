import React, { useState, useEffect } from 'react';
import { Save, FileText, FolderOpen, Trash2, PlusCircle } from 'lucide-react';
import { Note } from '@/utils/musicTheory';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface SheetManagerProps {
  notes: Note[];
  onLoadNotes: (notes: Note[], title: string) => void;
  onClearNotes: () => void;
}

interface MusicSheet {
  id: string;
  title: string;
  notes: Note[];
  created_at: string;
}

const SheetManager: React.FC<SheetManagerProps> = ({ notes, onLoadNotes, onClearNotes }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [sheets, setSheets] = useState<MusicSheet[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [newSheetTitle, setNewSheetTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      
      if (session) {
        fetchUserSheets();
      } else {
        setSheets([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setUser(session?.user || null);
      
      if (session) {
        fetchUserSheets();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserSheets = async () => {
    try {
      const { data, error } = await supabase
        .from('music_sheets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sheets:', error);
        toast.error('Failed to load music sheets');
        return;
      }

      const convertedSheets = data.map((sheet: any) => ({
        ...sheet,
        notes: sheet.notes as Note[]
      }));

      setSheets(convertedSheets as MusicSheet[]);
    } catch (error) {
      console.error('Error in fetchUserSheets:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleSaveSheet = async () => {
    if (!isAuthenticated) {
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
        user_id: user.id
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
      setIsSaveDialogOpen(false);
      setNewSheetTitle('');
      fetchUserSheets();
    } catch (error) {
      console.error('Error in handleSaveSheet:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSheet = (sheet: MusicSheet) => {
    onLoadNotes(sheet.notes, sheet.title);
    setIsOpenDialogOpen(false);
    toast.success(`Loaded "${sheet.title}"`);
  };

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
      fetchUserSheets();
    } catch (error) {
      console.error('Error in handleDeleteSheet:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleNewSheet = () => {
    onClearNotes();
    toast.success('Created new empty sheet');
  };

  const handleAuthClick = () => {
    toast.info('Authentication will be implemented soon');
  };

  return (
    <div className="glass p-4 rounded-lg flex flex-col gap-4 animate-scale-in">
      <h3 className="text-sm font-medium flex items-center gap-1.5">
        <FileText className="h-4 w-4" />
        <span>Sheet Manager</span>
      </h3>

      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={handleNewSheet}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Sheet
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => setIsSaveDialogOpen(true)}
          disabled={!isAuthenticated}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Sheet
        </Button>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => setIsOpenDialogOpen(true)}
          disabled={!isAuthenticated || sheets.length === 0}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Open Sheet
        </Button>

        {!isAuthenticated && (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full mt-2"
            onClick={handleAuthClick}
          >
            Sign in to save sheets
          </Button>
        )}
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
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
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSheet} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Sheet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
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
                  onClick={() => handleLoadSheet(sheet)}
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
            <Button variant="outline" onClick={() => setIsOpenDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SheetManager;
