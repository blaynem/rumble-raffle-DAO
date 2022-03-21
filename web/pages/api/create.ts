import createRoomSchema from '../../lib/schemaValidations/createRoom';

export default async function createRumble(req, res) {
  try {
    // Attempt to validate the body
    await createRoomSchema.validate(req.body, { abortEarly: false })

    // Need to convert these strings to numbers.
    const { params, ...restParsed } = JSON.parse(req.body);
    const paramsToNumbers = {
      ...params,
      entryFee: parseInt(params.entryFee, 10),
      pveChance: parseInt(params.pveChance, 10),
      reviveChance: parseInt(params.reviveChance, 10),
      prizeSplit: {
        kills: parseInt(params.prizeSplit.kills, 10),
        altSplit: parseInt(params.prizeSplit.altSplit, 10),
        firstPlace: parseInt(params.prizeSplit.firstPlace, 10),
        thirdPlace: parseInt(params.prizeSplit.thirdPlace, 10),
        secondPlace: parseInt(params.prizeSplit.secondPlace, 10),
        creatorSplit: parseInt(params.prizeSplit.creatorSplit, 10),
      },
    }

    const parsedBody = {...restParsed, params: paramsToNumbers}
    const stringedBody = JSON.stringify(parsedBody)
    // Make the fetch
    const { data, error } = await fetch(`http://localhost:3001/api/rooms/create`, {
      body: stringedBody,
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(res => res.json())
    if (error) {
      console.log('-----error--web-api', error)
      res.status(400).json({error})
      return;
    }
    res.status(200).json({data})
  } catch (err) {
    res.status(400).json(err)
  }
}