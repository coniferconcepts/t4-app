import React from 'react';
import { Text, YStack, InputProps, Input, Select } from 'tamagui';
import { observer } from '@legendapp/state/react';
import { ChevronDown, Check } from '@tamagui/lucide-icons';

interface StyledInputProps {
  value$: any;
  error$: any;
  validateOnBlur?: (value: any) => string | null;
  inputStyle?: InputProps['style'];
  inputTextStyle?: InputProps['style'];
  inputLabelStyle?: InputProps['style'];
  inputErrorStyle?: InputProps['style'];
  labelText?: string;
  placeholder?: string;
  type?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: () => void; // Add onChange prop for select
  options?: { id: number; value: string }[]; // Add options prop for select
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
    ...rest
  }: StyledInputProps) => {
    const handleBlur = () => {
      const error = validateOnBlur ? validateOnBlur(value$.get()) : null;
      error$.set(error || '');
      if (onBlur) onBlur();
    };

    const currentValue = value$.get();

    return (
      <YStack>
        {labelText && <Text style={inputLabelStyle}>{labelText}</Text>}
        {type === 'select' ? (
          <Select
            value={currentValue}
            onValueChange={(value) => {
              value$.set(value);
              if (onChange) onChange();
            }}
            {...rest}
          >
            <Select.Trigger iconAfter={ChevronDown} style={inputStyle}>
              <Select.Value placeholder={placeholder} />
            </Select.Trigger>
            <Select.Content>
              <Select.Viewport>
                <Select.Group>
                  {options?.map((option, i) => (
                    <Select.Item index={i} key={option.id} value={option.value}>
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
        ) : (
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
        )}
        {error$.get() && <Text style={inputErrorStyle}>{error$.get()}</Text>}
      </YStack>
    );
  }
);

export default StyledInput;
