import createRoomSchema from '../../lib/schemaValidations/createRoom';

export default async function createRumble(req, res) {
  try {
    // Attempt to validate the body
    await createRoomSchema.validate(req.body, { abortEarly: false })

    // Need to convert these strings to numbers.
    const { prize_split, entry_fee, pve_chance, revive_chance, ...restParsed } = JSON.parse(req.body);
    const paramsToNumbers = {
      ...restParsed,
      entry_fee: parseInt(entry_fee, 10),
      pve_chance: parseInt(pve_chance, 10),
      revive_chance: parseInt(revive_chance, 10),
      prize_kills: parseInt(prize_split.prize_kills, 10),
      prize_alt_split: parseInt(prize_split.prize_alt_split, 10),
      prize_first: parseInt(prize_split.prize_first, 10),
      prize_second: parseInt(prize_split.prize_second, 10),
      prize_third: parseInt(prize_split.prize_third, 10),
      prize_creator: parseInt(prize_split.prize_creator, 10),
    }

    const stringedBody = JSON.stringify(paramsToNumbers)
    // Make the fetch
    const { data, error } = await fetch(`http://localhost:3001/api/rooms/create`, {
      body: stringedBody,
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }).then(res => res.json())
    if (error) {
      res.status(400).json({error})
      return;
    }
    res.status(200).json({data})
  } catch (error) {
    res.status(400).json({error})
  }
}