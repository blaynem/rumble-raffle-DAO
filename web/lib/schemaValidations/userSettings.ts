import { object, string } from 'yup';

const userSettingsSchema = object({
  name: string().trim().max(30, 'Maximum character length is 30.').required('Name is required.'),
  discord: string().trim(),
})

export default userSettingsSchema;