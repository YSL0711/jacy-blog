import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Snowfall } from "@/components/Snowflake";
import { Button } from "@/components/ui/button";
import { JournalCard } from "@/components/journal/JournalCard";
import { JournalPasswordModal } from "@/components/journal/JournalPasswordModal";
import { JournalWriteDialog } from "@/components/journal/JournalWriteDialog";
import { JournalEntryDialog } from "@/components/journal/JournalEntryDialog";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2 } from "lucide-react";

interface JournalEntry {
  id: string;
  emoji: string;
  title: string;
  body: string;
  category: string;
  image_url?: string | null;
  created_at: string;
}

const Blog = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [writeDialogOpen, setWriteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editPasswordModalOpen, setEditPasswordModalOpen] = useState(false);
  
  // Selected entry for viewing/editing
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Handle Write button click
  const handleWriteClick = () => {
    setEntryToEdit(null);
    setPasswordModalOpen(true);
  };

  // Handle successful password for new entry
  const handleWritePasswordSuccess = () => {
    setWriteDialogOpen(true);
  };

  // Handle clicking on a card
  const handleCardClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewDialogOpen(true);
  };

  // Handle edit button in view dialog
  const handleEditClick = () => {
    setViewDialogOpen(false);
    setEntryToEdit(selectedEntry);
    setEditPasswordModalOpen(true);
  };

  // Handle successful password for editing
  const handleEditPasswordSuccess = () => {
    setWriteDialogOpen(true);
  };

  // Handle successful save
  const handleSaveSuccess = () => {
    fetchEntries();
    setEntryToEdit(null);
    setSelectedEntry(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F5F0' }}>
      <Snowfall />
      <Header />
      
      <main className="pt-28 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div className="flex-1">
              <h1 className="font-serif text-3xl md:text-4xl text-foreground leading-snug italic">
                "Little moments that make the season bright"
              </h1>
              <p className="font-display text-muted-foreground mt-2">
                A cozy corner for holiday memories
              </p>
            </div>
            
            <Button
              onClick={handleWriteClick}
              size="lg"
              className="font-display gap-2 rounded-full px-6 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/90"
            >
              <Plus className="w-5 h-5" />
              Write
            </Button>
          </div>

          {/* Entries Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-2xl border border-border/30">
              <span className="text-6xl mb-4 block">📌</span>
              <p className="font-display text-xl text-muted-foreground">
                No memories pinned yet.
              </p>
              <p className="font-display text-muted-foreground/70 mt-2">
                Be the first to share a cozy moment!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {entries.map((entry, index) => (
                <JournalCard
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onClick={() => handleCardClick(entry)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Password Modal for New Entry */}
      <JournalPasswordModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        onSuccess={handleWritePasswordSuccess}
      />

      {/* Password Modal for Editing */}
      <JournalPasswordModal
        open={editPasswordModalOpen}
        onOpenChange={setEditPasswordModalOpen}
        onSuccess={handleEditPasswordSuccess}
        title="Verify to edit"
        description="Enter the password to edit this memory"
      />

      {/* Write/Edit Dialog */}
      <JournalWriteDialog
        open={writeDialogOpen}
        onOpenChange={setWriteDialogOpen}
        onSuccess={handleSaveSuccess}
        editEntry={entryToEdit}
      />

      {/* View Entry Dialog */}
      <JournalEntryDialog
        entry={selectedEntry}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onEditClick={handleEditClick}
      />
    </div>
  );
};

export default Blog;
