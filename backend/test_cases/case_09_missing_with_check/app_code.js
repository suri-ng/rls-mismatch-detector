async function createNote(req, res) {
  const { data: note, error } = await supabase
    .from('notes')
    .insert({ user_id: req.user.id, content: req.body.content });
 
  if (error) return res.status(500).json({ error: error.message });
  res.json(note);
}
 
module.exports = { createNote };
