import { useState } from "react";
import { useNotes } from "@/hooks/use-notes";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Trash2, Plus, X, Save, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (id: string, currentTitle: string, currentContent: string) => {
    setEditingId(id);
    setTitle(currentTitle);
    setContent(currentContent);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (editingId) {
      updateNote(editingId, { title, content });
    } else {
      addNote(title || "Untitled", content);
    }
    setIsEditorOpen(false);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
        <Button onClick={handleOpenNew} data-testid="button-new-note" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl border-muted bg-card/50">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Edit className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No notes yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Jot down ideas, meeting notes, or random thoughts. They are saved securely in your browser.
          </p>
          <Button onClick={handleOpenNew}>Create your first note</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card 
              key={note.id} 
              className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col group overflow-hidden bg-card"
              onClick={() => handleOpenEdit(note.id, note.title, note.content)}
              data-testid={`note-card-${note.id}`}
            >
              <CardHeader className="pb-3 bg-muted/20 border-b border-transparent group-hover:border-border transition-colors">
                <CardTitle className="text-lg leading-tight line-clamp-1">{note.title || "Untitled"}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(note.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </CardHeader>
              <CardContent className="pt-4 flex-1">
                <p className="text-sm text-foreground/80 line-clamp-4 whitespace-pre-wrap">
                  {note.content || "Empty note"}
                </p>
              </CardContent>
              <CardFooter className="pt-0 pb-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  data-testid={`button-delete-note-${note.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0 border-none shadow-2xl">
          <DialogHeader className="p-4 border-b shrink-0 bg-muted/20">
            <DialogTitle>{editingId ? "Edit Note" : "New Note"}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none bg-transparent px-0 focus-visible:ring-0 shadow-none h-auto"
              data-testid="input-note-title"
              autoFocus
            />
            <Textarea
              placeholder="Start typing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 border-none bg-transparent px-0 focus-visible:ring-0 shadow-none resize-none text-base leading-relaxed"
              data-testid="input-note-content"
            />
          </div>
          
          <DialogFooter className="p-4 border-t shrink-0 bg-muted/20 flex sm:justify-between items-center">
            <Button variant="ghost" onClick={() => setIsEditorOpen(false)} className="shrink-0">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-note" className="shrink-0">
              <Save className="h-4 w-4 mr-2" />
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
