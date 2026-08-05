function AdminNotesPanel({ user }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (user.role !== 'admin') return; 
    supabase.from('notes').select('*').then(({ data }) => setNotes(data));
  }, [user]);

  if (user.role !== 'admin') {
    return <Redirect to="/" />;  
  }
  return <NotesTable notes={notes} />;
}

export default AdminNotesPanel;