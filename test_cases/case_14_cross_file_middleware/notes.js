async function updateNote(req, res) {
  const { data: note, error } = await supabase
    .from('notes')
    .update({ content: req.body.content })
    .eq('id', req.params.id);
 
  if (error) return res.status(500).json({ error: error.message });
  res.json(note);
}
 
module.exports = { updateNote };
