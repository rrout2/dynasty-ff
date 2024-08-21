import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import {useAdpData, usePlayerData} from '../../../hooks/hooks';

export default function PlayerSelectComponent(props: {
    playerIds: string[];
    selectedPlayerIds: string[];
    onChange: (newPlayerIds: string[]) => void;
    nonIdPlayerOptions?: string[];
    position?: string;
    label?: string;
    multiple?: boolean;
}) {
    const {
        playerIds,
        selectedPlayerIds,
        onChange,
        position,
        nonIdPlayerOptions,
        label,
        multiple,
    } = props;
    const {sortByAdp} = useAdpData();
    const playerData = usePlayerData();
    if (!playerData) return <></>;

    const allPlayerOptions = playerIds
        .map(playerId => playerData[playerId])
        .filter(player => {
            if (!player) return false;
            return !position || player.fantasy_positions.includes(position);
        })
        .sort(sortByAdp)
        .map(p => p.player_id);

    if (nonIdPlayerOptions) {
        allPlayerOptions.push(...nonIdPlayerOptions);
    }
    return (
        <FormControl
            style={{
                margin: '4px',
                minWidth: '100px',
            }}
        >
            <InputLabel>{label ?? position ?? 'Player'}</InputLabel>
            <Select
                value={selectedPlayerIds}
                label={label ?? position ?? 'Player'}
                onChange={(e: SelectChangeEvent<string[]>) => {
                    const {
                        target: {value},
                    } = e;
                    onChange(
                        typeof value === 'string' ? value.split(',') : value
                    );
                }}
                multiple={multiple ?? true}
            >
                {allPlayerOptions.map((option, idx) => {
                    const player = playerData[option];
                    const value = !player ? option : player.player_id;
                    const display = !player
                        ? option
                        : `${player.first_name} ${player.last_name}`;
                    return (
                        <MenuItem value={value} key={idx}>
                            {display}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
}
