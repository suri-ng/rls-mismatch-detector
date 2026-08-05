async function shareNote(req, res) {
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', req.params.noteId)
    .single();
 
  if (noteError || !note) return res.status(404).json({ error: 'Note not found' });
  if (note.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Only the owner can share this note' });
  }
 
  const { data, error } = await supabase
    .from('note_shares')
    .insert({
      note_id: req.params.noteId,
      shared_with: req.body.userId,
      role: req.body.role,
    });
 
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}
 
module.exports = { shareNote };
