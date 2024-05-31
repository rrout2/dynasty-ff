import {useEffect, useRef, useState} from 'react';
import {FANTASY_POSITIONS} from '../../../../../consts/fantasy';
import {useAdpData, usePlayerData} from '../../../../../hooks/hooks';
import styles from './CornerstoneModule.module.css';
import {
    InputLabel,
    SelectChangeEvent,
    FormControl,
    MenuItem,
    Select,
} from '@mui/material';
import {sortBySearchRank} from '../../../../Player/Search/PlayerSearch';
import {Player, Roster, User} from '../../../../../sleeper-api/sleeper-api';
import ExportButton from '../../shared/ExportButton';

export default function CornerstoneModule(props: {
    roster?: Roster;
    specifiedUser?: User;
}) {
    const {roster, specifiedUser} = props;
    const playerData = usePlayerData();
    const componentRef = useRef(null);
    const [_, getAdp] = useAdpData();
    const [cornerstones, setCornerstones] = useState(
        new Map<string, string[]>(FANTASY_POSITIONS.map(pos => [pos, []]))
    );

    function isCornerstone(player?: Player) {
        if (!player) return false;
        // this is probably pretty brittle
        const adp = getAdp(`${player.first_name} ${player.last_name}`);
        return adp <= 75 && adp >= 0;
    }

    useEffect(() => {
        if (!roster || !playerData) return;

        const cornerstones = roster.players
            .map(playerId => playerData[playerId])
            .filter(isCornerstone);

        setCornerstones(
            new Map<string, string[]>(
                FANTASY_POSITIONS.map(pos => [
                    pos,
                    cornerstones
                        .filter(player =>
                            player.fantasy_positions.includes(pos)
                        )
                        .map(player => player.player_id),
                ])
            )
        );
    }, [roster, playerData]);

    function graphicComponent() {
        if (!playerData) return <></>;
        return (
            <div className={styles.graphicComponent} ref={componentRef}>
                <div className={styles.positions}>
                    {FANTASY_POSITIONS.map(pos => (
                        <div className={styles.column}>
                            <div
                                className={`${styles.positionChip} ${styles[pos]}`}
                            >
                                {pos}
                            </div>
                            <div className={styles.cornerstoneList}>
                                {cornerstones
                                    .get(pos)!
                                    .map(playerId => playerData[playerId])
                                    .map(player => {
                                        return (
                                            <div>
                                                {`${player.first_name} ${player.last_name}`.toLocaleUpperCase()}
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    function playerSelectComponent(
        players: string[],
        selectedPlayerIds: string[],
        onChange: (event: SelectChangeEvent<string[]>) => void,
        position: string
    ) {
        if (!playerData) return <></>;
        return (
            <FormControl
                style={{
                    margin: '4px',
                }}
            >
                <InputLabel>{position}</InputLabel>
                <Select
                    value={selectedPlayerIds}
                    label={position}
                    onChange={onChange}
                    multiple={true}
                >
                    {players
                        .map(playerId => playerData[playerId])
                        .filter(
                            player =>
                                player &&
                                player.fantasy_positions.includes(position)
                        )
                        .sort(sortBySearchRank)
                        .map((player, idx) => (
                            <MenuItem value={player.player_id} key={idx}>
                                {player.first_name} {player.last_name}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>
        );
    }

    function allPositionalSelectors() {
        return FANTASY_POSITIONS.map(pos =>
            playerSelectComponent(
                roster?.players ?? [],
                cornerstones.get(pos) ?? [],
                (e: SelectChangeEvent<string[]>) => {
                    const {
                        target: {value},
                    } = e;
                    cornerstones.set(
                        pos,
                        typeof value === 'string' ? value.split(',') : value
                    );
                    setCornerstones(new Map(cornerstones));
                },
                pos
            )
        );
    }

    return (
        <>
            {graphicComponent()}
            {
                <ExportButton
                    className={styles.graphicComponent}
                    pngName={`${
                        specifiedUser?.metadata?.team_name ??
                        specifiedUser?.display_name
                    }_cornerstones.png`}
                />
            }
            {allPositionalSelectors()}
        </>
    );
}
