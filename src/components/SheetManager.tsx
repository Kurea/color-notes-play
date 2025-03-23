
import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Note } from '@/utils/musicTheory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SaveSheetDialog from './sheet-manager/SaveSheetDialog';
import OpenSheetDialog from './sheet-manager/OpenSheetDialog';
import SheetManagerActions from './sheet-manager/SheetManagerActions';
import { useMetronome } from '@/providers/MetronomeProvider';

interface SheetManagerProps {
  notes: Note[];
  onLoadNotes: (notes: Note[], title: string) => void;
  onNewTitle: (title: string) => void;
  onClearNotes: () => void;
}

interface MusicSheet {
  id: string;
  title: string;
  notes: Note[];
  tempo?: number;
  created_at: string;
}

const SheetManager: React.FC<SheetManagerProps> = ({ notes, onLoadNotes, onNewTitle, onClearNotes }) => {
  const { tempo, setTempo } = useMetronome();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [sheets, setSheets] = useState<MusicSheet[]>([]);
  const [currentSheet, setCurrentSheet] = useState<MusicSheet>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);

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

  const handleLoadSheet = (sheet: MusicSheet) => {
    setCurrentSheet(sheet);
    onLoadNotes(sheet.notes, sheet.title);
    
    // Set tempo if available in the loaded sheet
    if (sheet.tempo) {
      setTempo(sheet.tempo);
    }
    
    setIsOpenDialogOpen(false);
    toast.success(`Loaded "${sheet.title}"`);
  };

  const handleSaveSheet = (sheet: MusicSheet) => {
    onNewTitle(sheet.title);
    setCurrentSheet(sheet);
    toast.success(`Saved "${sheet.title}"`);
  }

  const handleNewSheet = () => {
    onClearNotes();
    setCurrentSheet(null);
    onNewTitle('Untitled Sheet');
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

      <SheetManagerActions 
        isAuthenticated={isAuthenticated}
        hasSheets={sheets.length > 0}
        onNewSheet={handleNewSheet}
        onOpenSaveDialog={() => setIsSaveDialogOpen(true)}
        onOpenLoadDialog={() => setIsOpenDialogOpen(true)}
        onAuthClick={handleAuthClick}
      />

      <SaveSheetDialog 
        isOpen={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        notes={notes}
        currentSheet={currentSheet}
        userId={user?.id}
        onSaveSheet={handleSaveSheet}
        onSheetSaved={fetchUserSheets}
        tempo={tempo}
      />

      <OpenSheetDialog 
        isOpen={isOpenDialogOpen}
        onOpenChange={setIsOpenDialogOpen}
        sheets={sheets}
        onLoadSheet={handleLoadSheet}
        onSheetsUpdated={fetchUserSheets}
      />
    </div>
  );
};

export default SheetManager;
