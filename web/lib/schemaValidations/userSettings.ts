import { object, string } from 'yup';

const userSettingsSchema = object({
  name: string().trim().required('Name is required.')
})

export default userSettingsSchema;