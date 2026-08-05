async function requireEditor(req, res, next) {
  const { data: note } = await supabase
    .from('notes')
    .select('user_id')
    .eq('id', req.params.id)
    .single();
 
  if (note && note.user_id === req.user.id) return next();
 
  const { data: share } = await supabase
    .from('note_shares')
    .select('role')
    .eq('note_id', req.params.id)
    .eq('shared_with', req.user.id)
    .single();
 
  if (share && share.role === 'editor') return next();
 
  return res.status(403).json({ error: 'Editor access required' });
}
 
module.exports = { requireEditor };
