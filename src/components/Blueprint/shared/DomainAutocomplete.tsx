import {Autocomplete, FormControl, TextField} from '@mui/material';
import {useState, useEffect} from 'react';
import {usePlayerData} from '../../../hooks/hooks';
import {Player} from '../../../sleeper-api/sleeper-api';
import {sortBySearchRank} from '../../Player/Search/PlayerSearch';
import {
    isRookiePickId,
    rookiePickIdToString,
} from '../v1/modules/playerstotarget/PlayersToTargetModule';
import {DARK_BLUE} from './DomainDropdown';

export type DomainAutocompleteProps = {
    selectedPlayer: string;
    setSelectedPlayer: (player: string) => void;
};

export default function DomainAutocomplete(props: DomainAutocompleteProps) {
    const {selectedPlayer, setSelectedPlayer} = props;
    const playerData = usePlayerData();
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [inputValue, setInputValue] = useState('');
    useEffect(() => {
        const players: Player[] = [];
        for (const playerId in playerData) {
            const player = playerData[playerId];
            players.push(player);
        }
        setAllPlayers(players);
    }, [playerData]);
    const opts = allPlayers
        .filter(p => !!p.team)
        .sort(sortBySearchRank)
        .map(p => p.player_id);
    opts.push('RP-2026');
    opts.push('RP-2027');
    opts.push('RP-FIRST-2026');
    opts.push('RP-FIRST-2027');
    if (!playerData) return <>no player data yet</>;
    return (
        <FormControl
            style={{
                margin: '4px',
                width: '200px',
            }}
        >
            <Autocomplete
                style={{
                    outline: `solid 2px ${'white'}`,
                    borderRadius: '8px',
                }}
                slotProps={{
                    popupIndicator: {
                        style: {
                            color: 'white',
                        },
                    },
                    clearIndicator: {
                        style: {
                            color: 'white',
                        },
                    },
                    listbox: {
                        style: {
                            backgroundColor: DARK_BLUE,
                            color: 'white',
                            fontFamily: 'Acumin Pro',
                            outline: `solid 2px ${'white'}`,
                        },
                    },
                }}
                options={opts}
                getOptionLabel={option => {
                    if (isRookiePickId(option)) {
                        return rookiePickIdToString(option);
                    }
                    const p = playerData[option];
                    return p ? `${p.first_name} ${p.last_name}` : '';
                }}
                autoHighlight
                value={selectedPlayer}
                onChange={(_event, newInputValue, reason) => {
                    if (reason === 'clear' || newInputValue === null) {
                        return;
                    }
                    setSelectedPlayer(newInputValue);
                }}
                inputValue={inputValue}
                onInputChange={(_event, value, _reason) => {
                    setInputValue(value);
                }}
                renderInput={params => (
                    <TextField
                        {...params}
                        sx={{
                            input: {
                                color: 'white',
                                fontFamily: 'Acumin Pro Condensed',
                                textTransform: 'uppercase',
                                fontStyle: 'italic',
                                fontSize: '16px',
                            },
                        }}
                    />
                )}
            />
        </FormControl>
    );
}
