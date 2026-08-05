// GET /api/notes

async function getNotes(req, res) {
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', req.user.id)
    .is('deleted_at', null);   
 
  if (error) return res.status(500).json({ error: error.message });
  res.json(notes);
}
 
module.exports = { getNotes };
