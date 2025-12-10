import {FormControl, MenuItem, Select, SelectProps} from '@mui/material';

export type DomainDropdownProps = SelectProps & {
    options: string[] | number[];
    outlineColor?: string;
    label?: string | JSX.Element;
    vertical?: boolean;
};

export const DARK_BLUE = '#04121C';

export default function DomainDropdown(props: DomainDropdownProps) {
    const {options, outlineColor, label, vertical = false} = props;
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: vertical ? 'column' : 'row',
                alignItems: vertical ? 'flex-start' : 'center',
                ...props.style,
            }}
        >
            {label && (
                <div
                    style={{
                        color: 'white',
                        fontFamily: 'Acumin Pro',
                        fontWeight: 'bold',
                        marginRight: vertical ? 0 : '6px',
                        marginBottom: vertical ? '6px' : 0,
                    }}
                >
                    {label}
                </div>
            )}
            <FormControl>
                <Select
                    {...props}
                    SelectDisplayProps={{
                        style: {
                            backgroundColor: DARK_BLUE,
                            color: 'white',
                            fontFamily: 'Acumin Pro',
                            fontWeight: 'bold',
                            outline: `solid 2px ${outlineColor || 'white'}`,
                            borderRadius: '8px',
                            paddingTop: '8px',
                            paddingBottom: '5px',
                        },
                    }}
                    MenuProps={{
                        slotProps: {
                            paper: {
                                style: {
                                    color: 'white',
                                    backgroundColor: '#4E4E4EBF',
                                },
                            },
                        },
                    }}
                    sx={{
                        '.MuiSelect-icon': {
                            color: 'white',
                        },
                    }}
                >
                    {options.map((option, idx) => (
                        <MenuItem
                            value={option}
                            key={idx}
                            style={{
                                fontFamily: 'Acumin Pro',
                                fontWeight: 'bold',
                            }}
                            divider={true}
                        >
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}
