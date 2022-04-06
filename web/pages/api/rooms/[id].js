import {BASE_API_URL} from '../../../lib/constants';

export default async function fetchRooms(req, res) {
  const { id } = req.query
  const {data, error} = await fetch(`${BASE_API_URL}/api/rooms/${id}`).then(res => res.json())
  if (error) {
    res.status(404).json({ error })
    return;
  }
  if (data.length > 0) {
    res.status(200).json({ data, error: null })
    return;
  }
  res.status(404).json({ error: 'There are no rooms matching this slug.', data: [] })
}