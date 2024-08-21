import styles from './PlayersToTargetModule.module.css';
import ExportButton from '../../../shared/ExportButton';
import {usePlayerData} from '../../../../../hooks/hooks';
import {logoImage} from '../../../shared/Utilities';
import {Autocomplete, FormControl, TextField} from '@mui/material';
import {Dispatch, Fragment, SetStateAction, useEffect, useState} from 'react';
import {Player} from '../../../../../sleeper-api/sleeper-api';
import {sortBySearchRank} from '../../../../Player/Search/PlayerSearch';

function PlayersToTargetModule(props: {
    teamName?: string;
    graphicComponentClass?: string;
}) {
    const {teamName, graphicComponentClass} = props;
    const [playerSuggestions, setPlayerSuggestions] = useState<string[]>([
        '10229',
        '5849',
        '4866',
        '10859',
    ]);
    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <GraphicComponent
                playerSuggestions={playerSuggestions}
                graphicComponentClass={graphicComponentClass}
                transparent={false}
            />
            <InputComponent
                playerSuggestions={playerSuggestions}
                setPlayerSuggestions={setPlayerSuggestions}
            />
            {!graphicComponentClass && (
                <ExportButton
                    className={styles.graphicComponent}
                    pngName={`${teamName}_playerstotarget.png`}
                />
            )}
        </div>
    );
}

interface graphicProps {
    playerSuggestions: string[];
    graphicComponentClass?: string;
    transparent?: boolean;
}
function GraphicComponent({
    playerSuggestions,
    graphicComponentClass,
    transparent,
}: graphicProps) {
    const playerData = usePlayerData();

    function playerTarget(playerId: string, idx: number) {
        if (!playerData) {
            return <></>;
        }
        const isRookiePick = isRookiePickId(playerId);
        const player = playerData[playerId];
        if (!player && !isRookiePick) {
            throw new Error(`Unexpected player ID: '${playerId}'`);
        }

        const pos = isRookiePick ? 'RP' : player.position;

        const fullName = isRookiePick
            ? rookiePickIdToString(playerId)
            : `${player.first_name} ${player.last_name}`;

        const displayName =
            !isRookiePick && fullName.length >= 15
                ? `${player.first_name[0]}. ${player.last_name}`
                : fullName;

        return (
            <div key={idx}>
                <div className={styles.playerTargetBody}>
                    <div className={`${styles.positionChip} ${styles[pos]}`}>
                        {pos}
                    </div>
                    {logoImage(
                        isRookiePick ? 'RP' : player?.team,
                        styles.teamLogo
                    )}
                    <div className={styles.targetName}>{displayName}</div>
                </div>
                <div className={styles.subtitle}>{`${pos} - ${
                    isRookiePick
                        ? playerId.substring(playerId.length - 4) // pull year from ID
                        : player.team
                }`}</div>
            </div>
        );
    }

    function graphicComponent() {
        if (!playerData) return <></>;
        return (
            <div
                className={`${styles.graphicComponent} ${
                    graphicComponentClass ?? ''
                } ${transparent ? '' : styles.background}`}
            >
                {playerSuggestions.map((playerId, idx) => {
                    return playerTarget(playerId, idx);
                })}
            </div>
        );
    }
    return graphicComponent();
}

interface inputProps {
    playerSuggestions: string[];
    setPlayerSuggestions: Dispatch<SetStateAction<string[]>>;
    label?: string;
}

function InputComponent({
    playerSuggestions,
    setPlayerSuggestions,
    label,
}: inputProps) {
    const inputStateList = playerSuggestions.map(suggestionId => {
        return useState(suggestionId);
    });
    const playerData = usePlayerData();
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    useEffect(() => {
        const players: Player[] = [];
        for (const playerId in playerData) {
            const player = playerData[playerId];
            players.push(player);
        }
        setAllPlayers(players);
    }, [playerData]);

    function playerAutocomplete(idx: number) {
        if (!playerData) return <></>;

        const opts = allPlayers
            .filter(p => !!p.team)
            .sort(sortBySearchRank)
            .map(p => p.player_id);
        opts.push('RP-2025');
        opts.push('RP-2026');
        opts.push('RP-FIRST-2025');
        opts.push('RP-FIRST-2026');

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
                        if (isRookiePickId(option)) {
                            return rookiePickIdToString(option);
                        }
                        const p = playerData[option];
                        return `${p.first_name} ${p.last_name}`;
                    }}
                    autoHighlight
                    value={playerSuggestions[idx]}
                    onChange={(_event, newInputValue, reason) => {
                        if (reason === 'clear' || newInputValue === null) {
                            return;
                        }
                        const newPlayerSuggestions = [...playerSuggestions];
                        newPlayerSuggestions[idx] = newInputValue;
                        setPlayerSuggestions(newPlayerSuggestions);
                    }}
                    inputValue={inputValue}
                    onInputChange={(_event, value, _reason) => {
                        setInputValue(value);
                    }}
                    renderInput={params => (
                        <TextField
                            {...params}
                            label={label ?? 'Choose a Player'}
                        />
                    )}
                />
            </FormControl>
        );
    }

    return (
        <>
            {playerSuggestions.map((_, idx) => (
                <Fragment key={idx}>{playerAutocomplete(idx)}</Fragment>
            ))}
        </>
    );
}

export function isRookiePickId(id: string) {
    return id.substring(0, 3) === 'RP-';
}

export function rookiePickIdToString(rookiePickId: string) {
    if (!isRookiePickId(rookiePickId)) {
        throw new Error(
            `Expected rookie pick ID to begin with 'RP-', instead got '${rookiePickId}'`
        );
    }
    if (rookiePickId.substring(3, 9) === 'FIRST-') {
        return `${rookiePickId.substring(9)} 1sts`;
    }
    return `${rookiePickId.substring(3)} Rookie Picks`;
}

export {PlayersToTargetModule, GraphicComponent, InputComponent};
