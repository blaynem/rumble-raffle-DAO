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

const createRoomSchema = object({
  params: object({
    pveChance: number().required(basicRequireMsg),
    reviveChance: number().max(10, 'Must be below 10%').required(basicRequireMsg),
    prizeSplit: object({
      kills: number().required(basicRequireMsg),
      altSplit: number().required(basicRequireMsg),
      firstPlace: number().required(basicRequireMsg),
      secondPlace: number().required(basicRequireMsg),
      thirdPlace: number().required(basicRequireMsg),
      creatorSplit: number().min(1, 'Minimum for creator split is 1%').required(basicRequireMsg)
    }).assurePrizeSplitTotal().required(),
    entryFee: number().required(basicRequireMsg),
    coinNetwork: string().required(basicRequireMsg),
    coinContract: string().required(basicRequireMsg),
  }).required(),
  user: object({
    publicAddress: string().required(),
    id: string().required(),
  }).required(basicRequireMsg),
  slug: string().required(basicRequireMsg),
})

export default createRoomSchema;