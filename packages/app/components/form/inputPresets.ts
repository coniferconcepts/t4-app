// inputPresets.ts
import * as v from 'valibot'

const EmailSchema = v.pipe(
  v.string('Your email must be a string.'),
  v.nonEmpty('Please enter your email.'),
  v.email('The email address is badly formatted.')
)
export type EmailInput = v.InferInput<typeof EmailSchema>
export type EmailOutput = v.InferOutput<typeof EmailSchema>

const StringSchema = v.pipe(
  v.string('Must be a string.'),
  v.nonEmpty('Please enter your response.')
)
export type StringInput = v.InferInput<typeof StringSchema>
export type StringOutput = v.InferOutput<typeof StringSchema>

const PasswordSchema = v.pipe(
  v.string('Your password must be a string.'),
  v.nonEmpty('Please enter your password.'),
  v.minLength(8, 'Your password must have 8 characters or more.')
)
export type PasswordInput = v.InferInput<typeof PasswordSchema>
export type PasswordOutput = v.InferOutput<typeof PasswordSchema>

const NumberSchema = v.pipe(
  v.string('Please enter a value.'),
  v.custom((input) => {
    if (!/^\d+(\.\d+)?$/.test(input)) {
      return 'Please enter a valid number.'
    }
    return input
  }),
  v.transform((input) => Number(input)),
  v.number('Please enter a valid number.'),
  v.minValue(1, 'Your number must be greater than 0.')
)
export type NumberInput = v.InferInput<typeof NumberSchema>
export type NumberOutput = v.InferOutput<typeof NumberSchema>

const SelectSchema = v.string('Please select an option.')
export type SelectInput = v.InferInput<typeof SelectSchema>
export type SelectOutput = v.InferOutput<typeof SelectSchema>

export const inputPresets = {
  string: {
    name: 'string',
    placeholder: '',
    type: 'text',
    schema: StringSchema,
  },
  password: {
    name: 'password',
    placeholder: 'Password',
    type: 'password',
    schema: PasswordSchema,
  },
  email: {
    name: 'email',
    placeholder: 'Email',
    type: 'email',
    schema: EmailSchema,
  },
  number: {
    name: 'number',
    placeholder: 'Number',
    type: 'number',
    schema: NumberSchema,
  },
  select: {
    name: 'select',
    placeholder: 'Select',
    type: 'select',
    schema: SelectSchema,
  },
}

export type InputPreset = keyof typeof inputPresets
export const getInputPreset = (preset: InputPreset) => inputPresets[preset]
