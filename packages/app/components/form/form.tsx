// Form.tsx
import React from 'react';
import { YStack, Text, Button } from 'tamagui';
import { useObservable } from '@legendapp/state/react';
import { AnySchema, safeParse } from 'valibot';
import StyledInput, { TamaguiReactiveInputProps } from './StyledInput';
import { getInputPreset, InputPreset } from './inputPresets';
import { batch, computed, when } from '@legendapp/state';

interface CustomInputConfig {
    name: string;
    placeholder?: string;
    type?: string;
    schema: AnySchema;
    labelText?: string;
}

interface PresetInputConfig {
    name: string;
    preset: InputPreset;
    labelText?: string;
}

interface FormProps {
    inputsConfig: (PresetInputConfig | CustomInputConfig)[];
    onSubmit: (formData: Record<string, any>) => void;
    formContainerStyle?: TamaguiReactiveInputProps['style'];
    inputContainerStyle?: TamaguiReactiveInputProps['style'];
    inputStyle?: TamaguiReactiveInputProps['style'];
    inputTextStyle?: TamaguiReactiveInputProps['style'];
    inputLabelStyle?: TamaguiReactiveInputProps['style'];
    inputErrorStyle?: TamaguiReactiveInputProps['style'];
    customButton?: JSX.Element | null;
    submitTrigger$: any; // Use appropriate observable type here
    showSubmit?: boolean;
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
}: FormProps) => {
    const values$ = {};
    const errors$ = {};
    const didSubmit$ = useObservable(false);
    const formError$ = useObservable('');

    // Initialize observables for each input
    inputsConfig.forEach((input) => {
        const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText } : input;
        values$[config.name] = useObservable('');
        errors$[config.name] = useObservable('');
    });

    // Use computed to observe changes and validate inputs reactively
    computed(() => {
        if (didSubmit$.get()) {
            console.log('Validating inputs...');
            batch(() => {
                inputsConfig.forEach((input) => {
                    const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText } : input;
                    const result = safeParse(config.schema, values$[config.name].get());
                    if (!result.success) {
                        console.log(`Validation error for ${config.name}:`, result.issues);
                    }
                    errors$[config.name].set(result.success ? '' : result.issues[0]?.message || 'Validation failed');
                });
                updateFormError();
            });
        }
    });

    const updateFormError = () => {
        const hasErrors = inputsConfig.some((input) => {
            const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText } : input;
            return errors$[config.name].get();
        });
        formError$.set(hasErrors ? 'Please check the form for errors.' : '');
    };

    const handleSubmit = () => {
        console.log('Handling form submission...');
        didSubmit$.set(true);

        // Trigger validation and check for errors
        let formIsValid = true;
        inputsConfig.forEach((input) => {
            const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText } : input;
            const result = safeParse(config.schema, values$[config.name].get());
            errors$[config.name].set(result.success ? '' : result.issues[0]?.message || 'Validation failed');
            if (!result.success) {
                console.log(`Validation error for ${config.name}:`, result.issues);
                formIsValid = false;
            }
        });

        if (formIsValid) {
            console.log('Form is valid. Preparing form data...');
            const formData = inputsConfig.reduce((acc, input) => {
                const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText } : input;
                let value = values$[config.name].get();
                // Convert to number if it's a number preset
                if (config.type === 'number') {
                    value = Number(value);
                }
                acc[config.name] = value;
                return acc;
            }, {});
            console.log('Form data prepared:', formData);
            onSubmit(formData);
            didSubmit$.set(false); // Reset didSubmit$ after successful submission
        } else {
            console.log('Form is invalid. Updating form errors...');
            updateFormError();
            didSubmit$.set(false); // Reset didSubmit$ after handling errors
        }

        // Set submitTrigger$ back to false after submission
        submitTrigger$.set(false);
    };

    // Use `when` to trigger form submission when `submitTrigger$` is set to true
    when(() => submitTrigger$.get(), handleSubmit);

    return (
        <YStack style={formContainerStyle}>
            {formError$.get() && <Text>{formError$.get()}</Text>}
            {inputsConfig.map((input) => {
                const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name, labelText: input.labelText } : input;
                return (
                    <YStack key={config.name} style={inputContainerStyle}>
                        <StyledInput
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
