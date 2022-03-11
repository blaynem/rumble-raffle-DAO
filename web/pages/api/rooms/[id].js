import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)

export default async function fetchRooms(req, res) {
  const { id } = req.query
  const {data, error} = await supabase.from('rooms').select().eq('slug', id)
  res.status(200).json(data)
}