import {Fragment, useEffect, useRef, useState} from 'react';
import {usePlayerData, useTitle} from '../../../../../hooks/hooks';
import styles from './PlayersToTargetModule.module.css';
import ExportButton from '../../shared/ExportButton';
import {Autocomplete, FormControl, TextField} from '@mui/material';
import {Player, User} from '../../../../../sleeper-api/sleeper-api';
import {sortBySearchRank} from '../../../../Player/Search/PlayerSearch';
import {logoImage} from '../../shared/Utilities';

export default function PlayersToTargetModule(props: {specifiedUser?: User}) {
    const {specifiedUser} = props;
    const playerData = usePlayerData();
    const componentRef = useRef(null);
    const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([
        '10229',
        '5849',
        '4866',
        '10859',
    ]);
    const inputStateList = playerSuggestions.map(suggestionId => {
        return useState(suggestionId);
    });
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);

    useEffect(() => {
        const players: Player[] = [];
        for (const playerId in playerData) {
            const player = playerData[playerId];
            players.push(player);
        }
        setAllPlayers(players);
    }, [playerData]);

    useTitle('Players to Target - Blueprint Generator');

    function playerTarget(playerId: string, idx: number) {
        if (!playerData) {
            return <></>;
        }

        const player = playerData[playerId];
        const pos = player.position;
        const fullName = `${player.first_name} ${player.last_name}`;
        const displayName =
            fullName.length >= 15
                ? `${player.first_name[0]}. ${player.last_name}`
                : fullName;
        const team = player.team;

        return (
            <div key={idx}>
                <div className={styles.playerTargetBody}>
                    <div className={`${styles.positionChip} ${styles[pos]}`}>
                        {pos}
                    </div>
                    {logoImage(team, styles.teamLogo)}
                    <div className={styles.targetName}>{displayName}</div>
                </div>
                <div className={styles.subtitle}>{`${pos} - ${team}`}</div>
            </div>
        );
    }

    function graphicComponent() {
        if (!playerData) return <></>;
        return (
            <div className={styles.graphicComponent} ref={componentRef}>
                {playerSuggestions.map((playerId, idx) => {
                    return playerTarget(playerId, idx);
                })}
            </div>
        );
    }

    function playerAutocomplete(idx: number) {
        if (!playerData) return <></>;

        const opts = allPlayers
            .filter(p => !!p.team && p.status === 'Active')
            .sort(sortBySearchRank)
            .map(p => p.player_id);

        const [inputValue, setInputValue] = inputStateList[idx];
        return (
            <FormControl
                style={{
                    margin: '4px',
                }}
            >
                <Autocomplete
                    options={opts}
                    getOptionLabel={option => {
                        const p = playerData[option];
                        return `${p.first_name} ${p.last_name}`;
                    }}
                    autoHighlight
                    value={playerSuggestions[idx]}
                    onChange={(_event, newInputValue, reason) => {
                        if (reason === 'clear' || newInputValue === null) {
                            return;
                        }
                        playerSuggestions[idx] = newInputValue;
                        setPlayerSuggestions(playerSuggestions);
                    }}
                    inputValue={inputValue}
                    onInputChange={(_event, value, _reason) => {
                        setInputValue(value);
                    }}
                    renderInput={params => (
                        <TextField {...params} label="Choose a Player" />
                    )}
                />
            </FormControl>
        );
    }
    return (
        <>
            {graphicComponent()}
            {playerSuggestions.map((_, idx) => (
                <Fragment key={idx}>{playerAutocomplete(idx)}</Fragment>
            ))}
            {
                <ExportButton
                    className={styles.graphicComponent}
                    pngName={`${
                        specifiedUser?.metadata?.team_name ??
                        specifiedUser?.display_name
                    }_playerstotarget.png`}
                />
            }
        </>
    );
}