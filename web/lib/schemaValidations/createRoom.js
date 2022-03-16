import { addMethod, object, string, number, SchemaOf } from 'yup';

// TODO: Convert this to typescript.

addMethod(object, 'assurePrizeSplitTotal', function (errorMessage) {
  return this.test('test-prize-split-total', errorMessage, function (prizeSplit) {
    const { createError } = this;
    const total = Object.values(prizeSplit).reduce((acc, curr) => curr += acc, 0);
    if (total !== 100) {
      return createError({ message: `Prize split totals must equal exactly 100. Current total: ${total}` })
    }
    return true;
  })
})

const createRoomSchema = object({
  params: object({
    pveChance: number().required(),
    reviveChance: number().required(),
    prizeSplit: object({
      kills: number().required(),
      altSplit: number().required(),
      firstPlace: number().required(),
      secondPlace: number().required(),
      thirdPlace: number().required(),
      creatorSplit: number().min(1, 'Minimum for creator split is 1%').required()
    }).assurePrizeSplitTotal().required(),
    entryFee: number().required(),
    coinNetwork: string().required(),
    coinContract: string().required(),
  }).required(),
  user: object({
    publicAddress: string().required(),
    id: string().required(),
  }).required(),
  slug: string().required(),
})

export default createRoomSchema;