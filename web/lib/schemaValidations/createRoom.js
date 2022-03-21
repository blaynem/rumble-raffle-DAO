import { addMethod, object, string, number } from 'yup';

// TODO: Convert this to typescript.

addMethod(object, 'assurePrizeSplitTotal', function (errorMessage) {
  return this.test('test-prize-split-total', errorMessage, function (prize_split) {
    const testArray = [prize_split.prize_alt_split, prize_split.prize_kills, prize_split.prize_first, prize_split.prize_second, prize_split.prize_third, prize_split.prize_creator]
    const { createError } = this;
    const total = testArray.reduce((acc, curr = 0) => curr += acc, 0);
    if (total !== 100) {
      return createError({ message: `Prize split totals must equal exactly 100%. Current total: ${total}%` })
    }
    return true;
  })
})

const basicRequireMsg = 'Required field'
const postiveValMsg = "Must be >= 0"

const createRoomSchema = object({
  alt_split_address: string().when('prize_split.altSplit', {
    is: (altSplit) => altSplit > 0,
    then: string().required('Address required if Alternative Split > 0')
  }),
  contract_address: string().required(basicRequireMsg),
  network: string().required(basicRequireMsg),
  pve_chance: number().min(0, postiveValMsg).required(basicRequireMsg),
  revive_chance: number().min(0, postiveValMsg).max(10, 'Must be below 10%').required(basicRequireMsg),
  entry_fee: number().min(0, postiveValMsg).required(basicRequireMsg),
  prize_split: object({
    prize_alt_split: number().min(0, postiveValMsg).required(basicRequireMsg),
    prize_kills: number().min(0, postiveValMsg).required(basicRequireMsg),
    prize_first: number().min(0, postiveValMsg).required(basicRequireMsg),
    prize_second: number().min(0, postiveValMsg).required(basicRequireMsg),
    prize_third: number().min(0, postiveValMsg).required(basicRequireMsg),
    prize_creator: number().min(1, 'Minimum for creator split is 1%').required(basicRequireMsg),
  }).assurePrizeSplitTotal().required(),
  user: object({
    publicAddress: string().required(),
    id: string().required(),
  }).required(basicRequireMsg),
  slug: string().required(basicRequireMsg).matches(/^[\w-]*$/, 'Allowed characters: a-z, 0-9, "_" and "-".')
})

export default createRoomSchema;