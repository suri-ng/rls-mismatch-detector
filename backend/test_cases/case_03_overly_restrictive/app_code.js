// GET /api/notes


async function getNotes(req, res) {
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*');
 
  if (error) return res.status(500).json({ error: error.message });
  res.json(notes);
}
 
module.exports = { getNotes };
 