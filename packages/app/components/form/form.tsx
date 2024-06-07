// Form.tsx
import { YStack, Button, Text } from 'tamagui';
import { useObservable } from '@legendapp/state/react';
import { AnySchema, safeParse } from 'valibot';
import StyledInput, { TamaguiReactiveInputProps } from './StyledInput';
import { getInputPreset, InputPreset } from './inputPresets';
import { batch, computed } from '@legendapp/state';

interface CustomInputConfig {
    name: string;
    placeholder?: string;
    type?: string;
    schema: AnySchema;
}

interface PresetInputConfig {
    name: string;
    preset: InputPreset;
}

interface FormProps {
    inputsConfig: (PresetInputConfig | CustomInputConfig)[];
    onSubmit: (formData: Record<string, any>) => void;
    containerStyle?: TamaguiReactiveInputProps['style'];
    inputStyle?: TamaguiReactiveInputProps['style'];
    textStyle?: TamaguiReactiveInputProps['style'];
}

const Form = ({ inputsConfig, onSubmit, containerStyle, inputStyle, textStyle }: FormProps) => {
    const values$ = {};
    const errors$ = {};
    const didSubmit$ = useObservable(false);
    const formError$ = useObservable('');

    // Initialize observables for each input
    inputsConfig.forEach((input) => {
        const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name } : input;
        values$[config.name] = useObservable('');
        errors$[config.name] = useObservable('');
    });

    // Use computed to observe changes and validate inputs reactively
    computed(() => {
        if (didSubmit$.get()) {
            batch(() => {
                inputsConfig.forEach((input) => {
                    const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name } : input;
                    const result = safeParse(config.schema, values$[config.name].get());
                    errors$[config.name].set(result.success ? '' : result.issues[0].message);
                });
                updateFormError();
            });
        }
    });

    const updateFormError = () => {
        const hasErrors = inputsConfig.some((input) => {
            const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name } : input;
            return errors$[config.name].get();
        });
        formError$.set(hasErrors ? 'Please check the form for errors.' : '');
    };

    const handleSubmit = () => {
        didSubmit$.set(true);
        const isValid = inputsConfig.every((input) => {
            const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name } : input;
            return !errors$[config.name].get();
        });

        if (isValid) {
            const formData = inputsConfig.reduce((acc, input) => {
                const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name } : input;
                let value = values$[config.name].get();
                // Convert to number if it's a number preset
                if (config.type === 'number') {
                    value = Number(value);
                }
                acc[config.name] = value;
                return acc;
            }, {});
            onSubmit(formData);
        } else {
            updateFormError();
        }
    };

    return (
        <YStack style={containerStyle}>
            {formError$.get() && <Text>{formError$.get()}</Text>}
            {inputsConfig.map((input) => {
                const config = 'preset' in input ? { ...getInputPreset(input.preset), name: input.name } : input;
                return (
                    <StyledInput
                        key={config.name}
                        value$={values$[config.name]}
                        error$={errors$[config.name]}
                        placeholder={config.placeholder}
                        type={config.type}
                        validateOnBlur={(value) => {
                            const result = safeParse(config.schema, value);
                            const error = result.success ? null : result.issues[0].message;
                            errors$[config.name].set(error || '');
                            updateFormError();
                            return error;
                        }}
                        inputStyle={inputStyle}
                        textStyle={textStyle}
                    />
                );
            })}
            <Button onPress={handleSubmit}>Submit</Button>
        </YStack>
    );
};

export default Form;
