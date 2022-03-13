
export default async function fetchRooms(req, res) {
  const { id } = req.query
  const data = await fetch(`http://localhost:3001/rooms/${id}`).then(res => res.json())
  // data only returns `activeRoom` boolean
  res.status(200).json(data)
}