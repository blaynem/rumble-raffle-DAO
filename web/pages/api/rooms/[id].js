
export default async function fetchRooms(req, res) {
  const { id } = req.query
  const {data, error} = await fetch(`http://localhost:3001/api/rooms/${id}`).then(res => res.json())
  // data only returns `activeRoom` boolean
  if (error) {
    res.status(404).json({ activeRoom: false })
    return;
  }
  if (data.length > 0) {
    res.status(200).json({ activeRoom: true })
    return;
  }
  res.status(404).json({ activeRoom: false })
}