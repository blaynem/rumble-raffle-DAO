import supabase from '../../client';

const defaultParams = {
  
}

// TODO: Finish implementing create
export default async function createRumble(req, res) {
  // const { params } = req?.body
  const params = defaultParams;
  console.log('===params', params);

  if (!params) {
    res.status(401)
    return
  }

  const data = await fetch(`http://localhost:3001/create`, {
    body: JSON.stringify({ params }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  }).then(res => res.json())
  // supabase upsert returns array
  res.status(200).json(data)
}