// GET /api/notes

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getNotes(req, res) {
  const { data: notes, error } = await supabaseAdmin
    .from('notes')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(notes);
}

module.exports = { getNotes };
