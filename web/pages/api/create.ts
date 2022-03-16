import createRoomSchema from '../../lib/schemaValidations/createRoom';

// TODO: Finish implementing create
export default async function createRumble(req, res) {
  try {
    // Attempt to validate the body
    await createRoomSchema.validate(req.body, { abortEarly: false })

    const {data, error} = await fetch(`http://localhost:3001/api/rooms/create`, {
      body: req.body,
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(res => res.json())
    if (error) {
      console.log('-----error--web-api', error)
      // res.status(400).json(error)
      return;
    }
    res.status(200).json(data)
  } catch (err) {
    res.status(400).json(err)
  }
}