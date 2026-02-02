import {FormControl, TextField, TextFieldProps} from '@mui/material';

export type DomainTextFieldProps = TextFieldProps & {
    outlineColor?: string;
    backgroundColor?: string;
    label?: string | JSX.Element;
    flexGrow?: number;
    labelMarginRight?: string;
    hideOutline?: boolean;
    inputWidth?: string;
};

export const DARK_BLUE = '#04121C';

export default function DomainTextField(props: DomainTextFieldProps) {
    const {
        outlineColor,
        backgroundColor,
        label,
        flexGrow = 0,
        labelMarginRight = '20px',
        hideOutline,
        inputWidth,
    } = props;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                ...props.style,
            }}
        >
            {label && (
                <div
                    style={{
                        color: 'white',
                        fontFamily: 'Prohibition',
                        fontSize: '20px',
                        marginRight: labelMarginRight,
                    }}
                >
                    {label}
                </div>
            )}

            <FormControl style={{flexGrow: flexGrow}}>
                <TextField
                    {...props}
                    label={undefined} // hide default label
                    slotProps={{
                        input: {
                            style: {
                                backgroundColor: backgroundColor || DARK_BLUE,
                                color: 'white',
                                fontFamily: 'Acumin Pro Condensed',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                outline: hideOutline
                                    ? 'none'
                                    : `solid 2px ${outlineColor || 'white'}`,
                                width: inputWidth,
                            },
                        },
                    }}
                    sx={{
                        '& .MuiInputBase-input': {
                            padding: '6px 12px',
                            color: 'white',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                        '& .MuiFormLabel-root': {
                            color: 'white',
                            fontFamily: 'Acumin Pro',
                        },
                        '& .MuiFormLabel-root.Mui-focused': {
                            color: 'white',
                        },
                    }}
                />
            </FormControl>
        </div>
    );
}
