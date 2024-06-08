// StyledInput.tsx
import { Text, GetProps, styled, YStack } from 'tamagui';
import { observer, Reactive } from '@legendapp/state/react';
import { when } from '@legendapp/state';

export const Tamagui_Reactive_Input = styled(Reactive.input, {
    name: 'ReactiveInput',
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    outlineWidth: 0,
    outlineStyle: 'none',
    focusStyle: {
        borderColor: 'blue',
    },
});

// Helper to get props for any TamaguiComponent
export type TamaguiReactiveInputProps = GetProps<typeof Tamagui_Reactive_Input>;

interface StyledInputProps extends Omit<TamaguiReactiveInputProps, 'value$'> {
    value$: any;
    error$: any;
    validateOnBlur?: (value: any) => string | null;
    inputStyle?: TamaguiReactiveInputProps['style'];
    inputTextStyle?: TamaguiReactiveInputProps['style'];
    inputLabelStyle?: TamaguiReactiveInputProps['style'];
    inputErrorStyle?: TamaguiReactiveInputProps['style'];
    labelText?: string;
}

const StyledInput = observer(({
    value$,
    error$,
    placeholder,
    type = 'text',
    validateOnBlur,
    inputStyle,
    inputTextStyle,
    inputLabelStyle,
    inputErrorStyle,
    labelText,
    ...rest
}: StyledInputProps) => {
    const handleBlur = () => {
        console.log(`Blurred input with value: ${value$.get()}`);
        const error = validateOnBlur ? validateOnBlur(value$.get()) : null;
        error$.set(error || '');
        console.log(`Error after blur: ${error$.get()}`);
    };

    return (
        <YStack>
            {labelText && <Text style={inputLabelStyle}>{labelText}</Text>}
            <Tamagui_Reactive_Input
                type={type}
                placeholder={placeholder}
                $value={value$}
                onBlur={handleBlur}
                style={inputStyle}
                {...rest}
            />
            {error$.get() && <Text style={inputErrorStyle}>{error$.get()}</Text>}
        </YStack>
    );
});

export default StyledInput;
