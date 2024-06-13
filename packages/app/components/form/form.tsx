import React from 'react'
import { YStack, Text, Button, InputProps } from 'tamagui'
import { observable, computed, batch, when } from '@legendapp/state'
import { useObservable } from '@legendapp/state/react'
import { AnySchema, safeParse } from 'valibot'
import StyledInput from './StyledInput'
import { getInputPreset, InputPreset } from './inputPresets'

interface CustomInputConfig {
  name: string
  placeholder?: string
  type?: string
  schema: AnySchema
  labelText?: string
  options?: { id: number; value: string }[] // Add options for custom inputs
}

interface PresetInputConfig {
  name: string
  preset: InputPreset
  labelText?: string
  options?: { id: number; value: string }[] // Add options for preset inputs
}

interface FormProps {
  inputsConfig: (PresetInputConfig | CustomInputConfig)[]
  onSubmit: (formData: Record<string, any>) => void
  formContainerStyle?: InputProps['style']
  inputContainerStyle?: InputProps['style']
  inputStyle?: InputProps['style']
  inputTextStyle?: InputProps['style']
  inputLabelStyle?: InputProps['style']
  inputErrorStyle?: InputProps['style']
  customButton?: JSX.Element | null
  submitTrigger$: any // Use appropriate observable type here
  showSubmit?: boolean
  autoSubmit?: boolean // New prop for auto-submit
}

const Form = ({
  inputsConfig,
  onSubmit,
  formContainerStyle,
  inputContainerStyle,
  inputStyle,
  inputTextStyle,
  inputLabelStyle,
  inputErrorStyle,
  customButton,
  submitTrigger$,
  showSubmit = true,
  autoSubmit = false, // Default to false
}: FormProps) => {
  const values$ = useObservable({})
  const errors$ = useObservable({})
  const focusStates$ = useObservable({})
  const touched$ = useObservable({})
  const didSubmit$ = useObservable(false)
  const formError$ = useObservable('')

  // Initialize observables for each input
  inputsConfig.forEach((input) => {
    const config =
      'preset' in input
        ? {
            ...getInputPreset(input.preset),
            name: input.name,
            labelText: input.labelText,
            options: input.options,
          }
        : input
    if (!values$[config.name]) values$[config.name] = useObservable('')
    if (!errors$[config.name]) errors$[config.name] = useObservable('')
    if (!focusStates$[config.name]) focusStates$[config.name] = useObservable(false) // Track focus state
    if (!touched$[config.name]) touched$[config.name] = useObservable(false) // Track if the field has been touched
  })

  const validateInput = (name: string) => {
    const inputConfig = inputsConfig.find((input) => input.name === name)
    if (inputConfig) {
      const config =
        'preset' in inputConfig
          ? {
              ...getInputPreset(inputConfig.preset),
              name: inputConfig.name,
              labelText: inputConfig.labelText,
              options: inputConfig.options,
            }
          : inputConfig
      const result = safeParse(config.schema, values$[name].get())
      errors$[name].set(result.success ? '' : result.issues[0]?.message || 'Validation failed')
      console.log(
        `Validating input ${name}, result: ${result.success}, error: ${errors$[name].get()}`
      )
    }
  }

  const updateFormError = () => {
    const hasErrors = inputsConfig.some((input) => {
      const config =
        'preset' in input
          ? {
              ...getInputPreset(input.preset),
              name: input.name,
              labelText: input.labelText,
              options: input.options,
            }
          : input
      return errors$[config.name].get()
    })
    formError$.set(hasErrors ? 'Please check the form for errors.' : '')
    console.log(`Form errors updated, hasErrors: ${hasErrors}`)
  }

  const handleSubmit = () => {
    console.log('Handling form submission...')
    didSubmit$.set(true)

    // Trigger validation and check for errors
    let formIsValid = true
    inputsConfig.forEach((input) => {
      const config =
        'preset' in input
          ? {
              ...getInputPreset(input.preset),
              name: input.name,
              labelText: input.labelText,
              options: input.options,
            }
          : input
      validateInput(config.name)
      if (errors$[config.name].get()) {
        formIsValid = false
      }
    })

    if (formIsValid) {
      console.log('Form is valid. Preparing form data...')
      const formData = inputsConfig.reduce((acc, input) => {
        const config =
          'preset' in input
            ? {
                ...getInputPreset(input.preset),
                name: input.name,
                labelText: input.labelText,
                options: input.options,
              }
            : input
        let value = values$[config.name].get()
        // Convert to number if it's a number preset
        if (config.type === 'number') {
          value = Number(value)
        }
        acc[config.name] = value
        return acc
      }, {})
      console.log('Form data prepared:', formData)
      onSubmit(formData)
      didSubmit$.set(false) // Reset didSubmit$ after successful submission
    } else {
      console.log('Form is invalid. Updating form errors...')
      updateFormError()
      didSubmit$.set(false) // Reset didSubmit$ after handling errors
    }

    // Set submitTrigger$ back to false after submission
    submitTrigger$.set(false)
  }

  // Use `when` to trigger form submission when `submitTrigger$` is set to true
  when(() => submitTrigger$.get(), handleSubmit)

  // Compute if all fields are valid and have been touched
  const allFieldsValidAndTouched$ = computed(() => {
    const result = inputsConfig.every((input) => {
      const config =
        'preset' in input
          ? {
              ...getInputPreset(input.preset),
              name: input.name,
              labelText: input.labelText,
              options: input.options,
            }
          : input
      const validResult = safeParse(config.schema, values$[config.name].get())
      const touched = touched$[config.name].get()
      console.log(`Field ${config.name}: valid = ${validResult.success}, touched = ${touched}`)
      return touched && validResult.success
    })
    console.log(`All fields valid and touched: ${result}`)
    return result
  })

  // Compute if any field has focus
  const anyFieldHasFocus$ = computed(() => {
    const result = inputsConfig.some((input) => {
      const config =
        'preset' in input
          ? {
              ...getInputPreset(input.preset),
              name: input.name,
              labelText: input.labelText,
              options: input.options,
            }
          : input
      const hasFocus = focusStates$[config.name].get()
      console.log(`Field ${config.name} has focus: ${hasFocus}`)
      return hasFocus
    })
    console.log(`Any field has focus: ${result}`)
    return result
  })

  // Use `when` to auto-submit if all fields are valid, no field has focus, and all fields have been touched
  when(() => {
    console.log('Auto-submit check:', {
      autoSubmit,
      allFieldsValidAndTouched: allFieldsValidAndTouched$.get(),
      anyFieldHasFocus: anyFieldHasFocus$.get(),
    })
    return autoSubmit && allFieldsValidAndTouched$.get() && !anyFieldHasFocus$.get()
  }, handleSubmit)

  const handleBlur = (name: string) => {
    validateInput(name)
    touched$[name].set(true) // Ensure the field is marked as touched
    updateFormError()
    if (autoSubmit) {
      // Check if auto-submit should be triggered
      console.log('auto submit checks for touched fields and no focus')
      console.log('allFieldsValidAndTouched$:', allFieldsValidAndTouched$.get())
      console.log('anyFieldHasFocus$:', anyFieldHasFocus$.get())
      if (allFieldsValidAndTouched$.get() && !anyFieldHasFocus$.get()) {
        handleSubmit()
      }
    }
  }

  const handleChange = (name: string) => {
    console.log('Handling change for field:', name)
    validateInput(name)
    touched$[name].set(true) // Ensure the field is marked as touched on change
    updateFormError()
    if (autoSubmit) {
      // Check if auto-submit should be triggered
      console.log('auto submit checks for touched fields and no focus')
      console.log('allFieldsValidAndTouched$:', allFieldsValidAndTouched$.get())
      console.log('anyFieldHasFocus$:', anyFieldHasFocus$.get())
      if (allFieldsValidAndTouched$.get() && !anyFieldHasFocus$.get()) {
        handleSubmit()
      }
    }
  }

  return (
    <YStack style={formContainerStyle}>
      {formError$.get() && <Text>{formError$.get()}</Text>}
      {inputsConfig.map((input, index) => {
        const config =
          'preset' in input
            ? {
                ...getInputPreset(input.preset),
                name: input.name,
                labelText: input.labelText,
                options: input.options,
              }
            : input
        return (
          <YStack key={index} style={inputContainerStyle}>
            <StyledInput
              key={config.name}
              value$={values$[config.name]}
              error$={errors$[config.name]}
              placeholder={config.placeholder}
              type={config.type}
              validateOnBlur={(value) => {
                const result = safeParse(config.schema, value)
                const error = result.success
                  ? null
                  : result.issues[0]?.message || 'Validation failed'
                errors$[config.name].set(error || '')
                updateFormError()
                return error
              }}
              inputStyle={inputStyle}
              inputTextStyle={inputTextStyle}
              inputLabelStyle={inputLabelStyle}
              inputErrorStyle={inputErrorStyle}
              labelText={config.labelText}
              onFocus={() => {
                focusStates$[config.name].set(true)
                touched$[config.name].set(true) // Mark the field as touched on focus
              }}
              onBlur={() => {
                focusStates$[config.name].set(false)
                handleBlur(config.name)
              }}
              onChange={() => handleChange(config.name)} // Handle change for Select component
              options={config.options} // Pass options to StyledInput
            />
          </YStack>
        )
      })}
      {showSubmit && customButton === undefined && (
        <Button onPress={() => submitTrigger$.set(true)}>Submit</Button>
      )}
      {customButton !== undefined && customButton}
    </YStack>
  )
}

export default Form
