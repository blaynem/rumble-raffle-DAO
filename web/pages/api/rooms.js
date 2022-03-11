import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)

export default async function fetchRooms(req, res) {
  // Fetch array of available rooms
  const {data, error} = await supabase.from('rooms').select()
  res.status(200).json(data)
}