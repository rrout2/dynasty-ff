import {FormControl, TextField, TextFieldProps} from '@mui/material';

export type DomainTextFieldProps = TextFieldProps & {
    outlineColor?: string;
    label?: string | JSX.Element;
    flexGrow?: number;
};

export const DARK_BLUE = '#04121C';

export default function DomainTextField(props: DomainTextFieldProps) {
    const {outlineColor, label, flexGrow = 0} = props;

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
                        marginRight: '20px',
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
                                backgroundColor: DARK_BLUE,
                                color: 'white',
                                fontFamily: 'Acumin Pro Condensed',
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                outline: `solid 2px ${outlineColor || 'white'}`,
                            },
                        },
                    }}
                    sx={{
                        '& .MuiInputBase-input': {
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
