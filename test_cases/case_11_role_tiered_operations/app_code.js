async function getNotes(req, res) {
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(notes);
}

async function updateNote(req, res) {
  const { data: note, error } = await supabase
    .from('notes')
    .update({ content: req.body.content })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(note);
}

async function deleteNote(req, res) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
}

module.exports = { getNotes, updateNote, deleteNote };