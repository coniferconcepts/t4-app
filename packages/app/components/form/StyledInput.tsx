// StyledInput.tsx
import { Text, GetProps, styled } from 'tamagui';
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
    textStyle?: TamaguiReactiveInputProps['style'];
}

const StyledInput = observer(({
    value$,
    error$,
    placeholder,
    type = 'text',
    validateOnBlur,
    inputStyle,
    textStyle,
    ...rest
}: StyledInputProps) => {
    const handleBlur = () => {
        console.log(`Blurred input with value: ${value$.get()}`);
        const error = validateOnBlur ? validateOnBlur(value$.get()) : null;
        error$.set(error || '');
        console.log(`Error after blur: ${error$.get()}`);
    };

    return (
        <div>
            <Tamagui_Reactive_Input
                type={type}
                placeholder={placeholder}
                $value={value$}
                onBlur={handleBlur}
                style={inputStyle}
                {...rest}
            />
            {error$.get() && <Text style={textStyle}>{error$.get()}</Text>}
        </div>
    );
});

export default StyledInput;
