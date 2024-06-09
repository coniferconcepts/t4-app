import React from 'react';
import { Text, YStack, InputProps, Input } from 'tamagui';
import { observer } from '@legendapp/state/react';

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
}

const StyledInput = observer(({
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
            <Input
                placeholder={placeholder}
                value={currentValue}
                onChangeText={(value) => value$.set(value)}
                secureTextEntry={type?.includes('password')}
                onBlur={handleBlur}
                onFocus={onFocus}
                style={inputStyle}
                {...rest}
            />
            {error$.get() && <Text style={inputErrorStyle}>{error$.get()}</Text>}
        </YStack>
    );
});

export default StyledInput;
