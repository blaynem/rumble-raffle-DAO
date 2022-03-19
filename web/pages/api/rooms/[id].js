
export default async function fetchRooms(req, res) {
  const { id } = req.query
  const {data, error} = await fetch(`http://localhost:3001/api/rooms/${id}`).then(res => res.json())
  if (error) {
    res.status(404).json({ error })
    return;
  }
  if (data.length > 0) {
    res.status(200).json({ data })
    return;
  }
  res.status(404).json({ error })
}