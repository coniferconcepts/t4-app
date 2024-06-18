import React from 'react'
import {
  Text,
  YStack,
  Input,
  Select,
  Switch,
  Slider,
  XStack,
  Label,
  RadioGroup,
  ToggleGroup,
  TextArea,
} from 'tamagui'
import { observer } from '@legendapp/state/react'
import { ChevronDown, Check } from '@tamagui/lucide-icons'

interface StyledInputProps {
  value$: any
  error$: any
  validateOnBlur?: (value: any) => string | null
  inputStyle?: any
  inputTextStyle?: any
  inputLabelStyle?: any
  inputErrorStyle?: any
  labelText?: string
  placeholder?: string
  type?: string
  onFocus?: () => void
  onBlur?: () => void
  onChange?: () => void
  options?: { id: number; value: string }[]
  id?: string
  size?: string
  defaultChecked?: boolean
  style?: object
}

const StyledInput = observer(
  ({
    value$,
    error$,
    placeholder,
    validateOnBlur,
    inputStyle,
    inputTextStyle,
    inputLabelStyle,
    inputErrorStyle,
    labelText,
    type,
    onFocus,
    onBlur,
    onChange,
    options,
    id,
    size,
    defaultChecked,
    style,
    ...rest
  }: StyledInputProps) => {
    const handleBlur = () => {
      const error = validateOnBlur ? validateOnBlur(value$.get()) : null
      error$.set(error || '')
      if (onBlur) onBlur()
    }

    const currentValue = value$.get() || (type === 'toggleGroup' || type === 'radioGroup' ? [] : '')

    const renderInputByType = () => {
      switch (type) {
        case 'select':
          return (
            <Select
              value={currentValue}
              onValueChange={(value) => {
                value$.set(value)
                onChange?.()
              }}
              {...rest}
            >
              <Select.Trigger iconAfter={ChevronDown} style={inputStyle}>
                <Select.Value placeholder={placeholder} />
              </Select.Trigger>
              <Select.Content>
                <Select.Viewport>
                  <Select.Group>
                    {options?.map((option, index) => (
                      <Select.Item index={index} key={option.id} value={option.value}>
                        <Text>{option.value}</Text>
                        <Select.ItemIndicator>
                          <Check size={16} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
              </Select.Content>
            </Select>
          )
        case 'switch':
          return (
            <XStack alignItems='center' gap='$4'>
              <Switch
                size='$4'
                onCheckedChange={(value) => {
                  value$.set(value)
                  if (onChange) onChange()
                }}
                {...rest}
              >
                <Switch.Thumb animation='bouncy' />
              </Switch>
            </XStack>
          )
        case 'slider':
          return (
            <YStack margin='$6' gap='$2'>
              <Slider
                value={[currentValue]} // Ensure the value is an array
                onValueChange={(value) => {
                  value$.set(value[0]) // Assuming single value slider
                  if (onChange) onChange()
                }}
                {...style}
                {...rest}
              >
                <Slider.Track>
                  <Slider.TrackActive />
                </Slider.Track>
                <Slider.Thumb index={0} circular elevate />
              </Slider>
              <Text marginTop={10} alignSelf='center'>{currentValue}</Text>
            </YStack>
          )
        case 'radioGroup':
          return (
            <RadioGroup
              value={currentValue}
              onValueChange={(value) => {
                value$.set(value)
                onChange?.()
              }}
              {...rest}
            >
              {options?.map((option, i) => (
                <XStack key={option.id} alignItems='center' gap='$2'>
                  <RadioGroup.Item value={option.value}>
                    <RadioGroup.Indicator />
                  </RadioGroup.Item>
                  <Text>{option.value}</Text>
                </XStack>
              ))}
            </RadioGroup>
          )
        case 'toggleGroup':
          return (
            <ToggleGroup
              type='multiple'
              value={currentValue}
              onValueChange={(value) => {
                value$.set(value)
                onChange?.()
              }}
              {...rest}
            >
              {options?.map((option, i) => (
                <ToggleGroup.Item key={option.id} value={option.value}>
                  <Text>{option.value}</Text>
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          )
        case 'textArea':
          return (
            <TextArea
              value={currentValue}
              onChangeText={(value) => {
                value$.set(value)
                if (onChange) onChange()
              }}
              {...rest}
            />
          )
        default:
          return (
            <Input
              placeholder={placeholder}
              value={currentValue}
              onChangeText={(value) => {
                value$.set(value)
                if (onChange) onChange()
              }}
              secureTextEntry={type?.includes('password')}
              onBlur={handleBlur}
              onFocus={onFocus}
              style={inputStyle}
              {...rest}
            />
          )
      }
    }

    return (
      <YStack>
        {labelText && <Text style={inputLabelStyle}>{labelText}</Text>}
        {renderInputByType()}
        {error$.get() && <Text style={inputErrorStyle}>{error$.get()}</Text>}
      </YStack>
    )
  }
)

export default StyledInput
