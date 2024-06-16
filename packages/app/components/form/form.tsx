import React from 'react';
import { YStack, Text, Button, InputProps } from 'tamagui';
import { observable, computed, batch, when } from '@legendapp/state';
import { useObservable } from '@legendapp/state/react';
import { AnySchema, safeParse } from 'valibot';
import StyledInput from './StyledInput';
import { getInputPreset, InputPreset } from './inputPresets';
import * as v from 'valibot';

interface CustomInputConfig {
  name: string;
  placeholder?: string;
  type?: string;
  schema: AnySchema;
  labelText?: string;
  options?: { id: number; value: string }[];
  id?: string;
  size?: string;
  defaultChecked?: boolean;
  style?: object;
}

interface PresetInputConfig {
  name: string;
  preset: InputPreset;
  labelText?: string;
  placeholder?: string;
  options?: { id: number; value: string }[];
  id?: string;
  size?: string;
  defaultChecked?: boolean;
  style?: object;
}

type InputType = 'text' | 'number' | 'select' | 'switch' | 'radioGroup' | 'toggleGroup' | 'textBox' | 'slider';

interface InputBase {
  name: string;
  labelText: string;
  placeholder?: string;
  type?: InputType;
  options?: { id: number; value: string }[];
  style?: object;
}

interface StringInput extends InputBase {
  preset: 'string';
  schema?: v.AnySchema;
}

interface NumberInput extends InputBase {
  preset: 'number';
  schema?: v.AnySchema;
}

interface SelectInput extends InputBase {
  preset: 'select';
  schema?: v.AnySchema;
}

interface SwitchInput extends InputBase {
  preset: 'switch';
  style?: { size?: string; defaultChecked?: boolean };
}

interface RadioGroupInput extends InputBase {
  preset: 'radioGroup';
  options: { id: number; value: string }[];
}

interface ToggleGroupInput extends InputBase {
  preset: 'toggleGroup';
  options: { id: number; value: string }[];
}

interface TextAreaInput extends InputBase {
  preset: 'textArea';
  schema?: v.AnySchema;
  style?: { minHeight?: number };
}

interface SliderInput extends InputBase {
  preset: 'slider';
  schema?: v.AnySchema;
  style?: { max?: number; step?: number };
}

export type InputConfig = StringInput | NumberInput | SelectInput | SwitchInput | RadioGroupInput | ToggleGroupInput | TextAreaInput | SliderInput;

interface FormProps {
  inputsConfig: (PresetInputConfig | CustomInputConfig)[];
  onSubmit: (formData: Record<string, any>) => void;
  formContainerStyle?: InputProps['style'];
  inputContainerStyle?: InputProps['style'];
  inputStyle?: InputProps['style'];
  inputTextStyle?: InputProps['style'];
  inputLabelStyle?: InputProps['style'];
  inputErrorStyle?: InputProps['style'];
  customButton?: JSX.Element | null;
  submitTrigger$: any;
  showSubmit?: boolean;
  autoSubmit?: boolean;
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
  autoSubmit = false,
}: FormProps) => {
  const values$ = useObservable({});
  const errors$ = useObservable({});
  const focusStates$ = useObservable({});
  const touched$ = useObservable({});
  const didSubmit$ = useObservable(false);
  const formError$ = useObservable('');

  // biome-ignore lint/complexity/noForEach: <explanation>
  inputsConfig.forEach((input) => {
    const config =
      'preset' in input
        ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText, placeholder: input.placeholder, options: input.options, id: input.name, size: input.size, defaultChecked: input.defaultChecked, style: input.style }
        : input;
    if (!values$[config.name]) values$[config.name] = useObservable('');
    if (!errors$[config.name]) errors$[config.name] = useObservable('');
    if (!focusStates$[config.name]) focusStates$[config.name] = useObservable(false);
    if (!touched$[config.name]) touched$[config.name] = useObservable(false);
  });

  const validateInput = (name: string) => {
    const inputConfig = inputsConfig.find((input) => input.name === name);
    if (inputConfig) {
      const config =
        'preset' in inputConfig
          ? { ...getInputPreset(inputConfig.preset), name: inputConfig.name, labelText: inputConfig.labelText, placeholder: inputConfig.placeholder, options: inputConfig.options, id: inputConfig.name, size: inputConfig.size, defaultChecked: inputConfig.defaultChecked, style: inputConfig.style }
          : inputConfig;
      const result = safeParse(config.schema, values$[name].get());
      errors$[name].set(result.success ? '' : result.issues[0]?.message || 'Validation failed');
      console.log(`Validating input ${name}, result: ${result.success}, error: ${errors$[name].get()}`);
    }
  };

  const updateFormError = () => {
    const hasErrors = inputsConfig.some((input) => {
      const config =
        'preset' in input
          ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText, placeholder: input.placeholder, options: input.options, id: input.name, size: input.size, defaultChecked: input.defaultChecked, style: input.style }
          : input;
      return errors$[config.name].get();
    });
    formError$.set(hasErrors ? 'Please check the form for errors.' : '');
    console.log(`Form errors updated, hasErrors: ${hasErrors}`);
  };

  const handleSubmit = () => {
    console.log('Handling form submission...');
    didSubmit$.set(true);

    let formIsValid = true;
    // biome-ignore lint/complexity/noForEach: <explanation>
    inputsConfig.forEach((input) => {
      const config =
        'preset' in input
          ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText, placeholder: input.placeholder, options: input.options, id: input.name, size: input.size, defaultChecked: input.defaultChecked, style: input.style }
          : input;
      validateInput(config.name);
      if (errors$[config.name].get()) {
        formIsValid = false;
      }
    });

    if (formIsValid) {
      console.log('Form is valid. Preparing form data...');
      const formData = inputsConfig.reduce((acc, input) => {
        const config =
          'preset' in input
            ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText, placeholder: input.placeholder, options: input.options, id: input.name, size: input.size, defaultChecked: input.defaultChecked, style: input.style }
            : input;
        let value = values$[config.name].get();
        if (config.type === 'number' || config.type === 'slider') {
          value = Number(value);
        }
        acc[config.name] = value;
        return acc;
      }, {});
      console.log('Form data prepared:', formData);
      onSubmit(formData);
      didSubmit$.set(false);
    } else {
      console.log('Form is invalid. Updating form errors...');
      updateFormError();
      didSubmit$.set(false);
    }
    submitTrigger$.set(false);
  };

  when(() => submitTrigger$.get(), handleSubmit);

  const allFieldsValidAndTouched$ = computed(() => {
    const result = inputsConfig.every((input) => {
      const config =
        'preset' in input
          ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText, placeholder: input.placeholder, options: input.options, id: input.name, size: input.size, defaultChecked: input.defaultChecked, style: input.style }
          : input;
      const validResult = safeParse(config.schema, values$[config.name].get());
      const touched = touched$[config.name].get();
      console.log(`Field ${config.name}: valid = ${validResult.success}, touched = ${touched}`);
      return touched && validResult.success;
    });
    console.log(`All fields valid and touched: ${result}`);
    return result;
  });

  const anyFieldHasFocus$ = computed(() => {
    const result = inputsConfig.some((input) => {
      const config =
        'preset' in input
          ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText, placeholder: input.placeholder, options: input.options, id: input.name, size: input.size, defaultChecked: input.defaultChecked, style: input.style }
          : input;
      const hasFocus = focusStates$[config.name].get();
      console.log(`Field ${config.name} has focus: ${hasFocus}`);
      return hasFocus;
    });
    console.log(`Any field has focus: ${result}`);
    return result;
  });

  when(() => {
    console.log('Auto-submit check:', {
      autoSubmit,
      allFieldsValidAndTouched: allFieldsValidAndTouched$.get(),
      anyFieldHasFocus: anyFieldHasFocus$.get(),
    });
    return autoSubmit && allFieldsValidAndTouched$.get() && !anyFieldHasFocus$.get();
  }, handleSubmit);

  const handleBlur = (name: string) => {
    validateInput(name);
    touched$[name].set(true);
    updateFormError();
    if (autoSubmit) {
      console.log('auto submit checks for touched fields and no focus');
      console.log('allFieldsValidAndTouched$:', allFieldsValidAndTouched$.get());
      console.log('anyFieldHasFocus$:', anyFieldHasFocus$.get());
      if (allFieldsValidAndTouched$.get() && !anyFieldHasFocus$.get()) {
        handleSubmit();
      }
    }
  };

  const handleChange = (name: string) => {
    console.log('Handling change for field:', name);
    validateInput(name);
    touched$[name].set(true);
    updateFormError();
    if (autoSubmit) {
      console.log('auto submit checks for touched fields and no focus');
      console.log('allFieldsValidAndTouched$:', allFieldsValidAndTouched$.get());
      console.log('anyFieldHasFocus$:', anyFieldHasFocus$.get());
      if (allFieldsValidAndTouched$.get() && !anyFieldHasFocus$.get()) {
        handleSubmit();
      }
    }
  };

  return (
    <YStack style={formContainerStyle}>
      {formError$.get() && <Text>{formError$.get()}</Text>}
      {inputsConfig.map((input, index) => {
        const config =
          'preset' in input
            ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText, placeholder: input.placeholder, options: input.options, id: input.name, size: input.size, defaultChecked: input.defaultChecked, style: input.style }
            : input;
        return (
          <YStack key={input.name} style={inputContainerStyle}>
            <StyledInput
              key={config.name}
              value$={values$[config.name]}
              error$={errors$[config.name]}
              placeholder={config.placeholder}
              type={config.type}
              validateOnBlur={(value) => {
                const result = safeParse(config.schema, value);
                const error = result.success ? null : result.issues[0]?.message || 'Validation failed';
                errors$[config.name].set(error || '');
                updateFormError();
                return error;
              }}
              inputStyle={inputStyle}
              inputTextStyle={inputTextStyle}
              inputLabelStyle={inputLabelStyle}
              inputErrorStyle={inputErrorStyle}
              labelText={config.labelText}
              onFocus={() => {
                focusStates$[config.name].set(true);
                touched$[config.name].set(true);
              }}
              onBlur={() => {
                focusStates$[config.name].set(false);
                handleBlur(config.name);
              }}
              onChange={() => handleChange(config.name)}
              options={config.options}
              id={config.name}
              size={config.size}
              defaultChecked={config.defaultChecked}
              style={config.style}
            />
          </YStack>
        );
      })}
      {showSubmit && customButton === undefined && (
        <Button onPress={() => submitTrigger$.set(true)}>Submit</Button>
      )}
      {customButton !== undefined && customButton}
    </YStack>
  );
};

export default Form;
