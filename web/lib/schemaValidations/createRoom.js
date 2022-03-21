import { addMethod, object, string, number, SchemaOf } from 'yup';

// TODO: Convert this to typescript.

addMethod(object, 'assurePrizeSplitTotal', function (errorMessage) {
  return this.test('test-prize-split-total', errorMessage, function (prizeSplit) {
    const { createError } = this;
    const total = Object.values(prizeSplit).reduce((acc, curr) => curr += acc, 0);
    if (total !== 100) {
      return createError({ message: `Prize split totals must equal exactly 100%. Current total: ${total}%` })
    }
    return true;
  })
})

const basicRequireMsg = 'Required field'
const postiveValMsg = "Must be >= 0"

const createRoomSchema = object({
  params: object({
    pveChance: number().min(0, postiveValMsg).required(basicRequireMsg),
    reviveChance: number().min(0, postiveValMsg).max(10, 'Must be below 10%').required(basicRequireMsg),
    prizeSplit: object({
      kills: number().min(0, postiveValMsg).required(basicRequireMsg),
      altSplit: number().min(0, postiveValMsg).required(basicRequireMsg),
      firstPlace: number().min(0, postiveValMsg).required(basicRequireMsg),
      secondPlace: number().min(0, postiveValMsg).required(basicRequireMsg),
      thirdPlace: number().min(0, postiveValMsg).required(basicRequireMsg),
      creatorSplit: number().min(1, 'Minimum for creator split is 1%').required(basicRequireMsg)
    }).assurePrizeSplitTotal().required(),
    entryFee: number().min(0, postiveValMsg).required(basicRequireMsg),
    coinNetwork: string().required(basicRequireMsg),
    coinContract: string().required(basicRequireMsg),
    altSplitAddress: string().when('prizeSplit.altSplit', {
      is: (altSplit) => altSplit > 0,
      then: string().required('Address required if Alternative Split > 0')
    })
  }).required(),
  user: object({
    publicAddress: string().required(),
    id: string().required(),
  }).required(basicRequireMsg),
  slug: string().required(basicRequireMsg).matches(/^[\w-]*$/, 'Allowed characters: a-z, 0-9, "_" and "-".')
})

export default createRoomSchema;