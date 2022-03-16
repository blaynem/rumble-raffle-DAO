import createRoomSchema from '../../lib/schemaValidations/createRoom';

// TODO: Finish implementing create
export default async function createRumble(req, res) {
  try {
    // Attempt to validate the body
    await createRoomSchema.validate(req.body, { abortEarly: false })

    const data = await fetch(`http://localhost:3001/create`, {
      body: req.body,
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(res => res.json())
    res.status(200).json(data)
  } catch (err) {
    res.status(400).json(err)
  }
}