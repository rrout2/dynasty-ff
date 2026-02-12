import styles from './CornerstoneModule.module.css';
import {Player, Roster} from '../../../../../sleeper-api/sleeper-api';
import ExportButton from '../../../shared/ExportButton';
import {FANTASY_POSITIONS, QB, RB, TE, WR} from '../../../../../consts/fantasy';
import {
    useAdpData,
    useAdpDataJson,
    usePlayerData,
} from '../../../../../hooks/hooks';
import PlayerSelectComponent from '../../../shared/PlayerSelectComponent';
import {SetStateAction, useEffect, useState} from 'react';

export function useCornerstones(roster?: Roster) {
    const playerData = usePlayerData();
    const {getAdp, sortByAdp} = useAdpDataJson();
    const [cornerstones, setCornerstones] = useState(
        new Map<string, string[]>(FANTASY_POSITIONS.map(pos => [pos, []]))
    );
    function isCornerstone(player?: Player) {
        if (!player) return false;
        const adp = getAdp(`${player.first_name} ${player.last_name}`);
        switch (player.position) {
            case QB:
                return adp <= 75;
            case RB:
                return adp <= 75 && player.age < 27;
            case WR:
                return adp <= 75 && player.age < 28;
            case TE:
                return adp <= 75 && player.age < 29;
            default:
                return false;
        }
    }

    useEffect(() => {
        if (!roster || !playerData) return;

        const cornerstones = roster.players
            .map(playerId => playerData[playerId])
            .filter(isCornerstone)
            .sort(sortByAdp);

        setCornerstones(
            new Map<string, string[]>(
                FANTASY_POSITIONS.map(pos => [
                    pos,
                    cornerstones
                        .filter(player =>
                            player.fantasy_positions.includes(pos)
                        )
                        .map(player => player.player_id)
                        .slice(0, 3),
                ])
            )
        );
    }, [roster, playerData]);

    return {cornerstones, setCornerstones};
}

function CornerstoneModule(props: {
    roster?: Roster;
    teamName?: string;
    graphicComponentClass?: string;
}) {
    const {roster, teamName, graphicComponentClass} = props;
    const {cornerstones, setCornerstones} = useCornerstones(roster);
    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <GraphicComponent
                cornerstones={cornerstones}
                graphicComponentClass={graphicComponentClass}
                transparent={false}
            />
            {!graphicComponentClass && (
                <ExportButton
                    className={styles.graphicComponent}
                    pngName={`${teamName}_cornerstones.png`}
                />
            )}
            <AllPositionalSelectors
                cornerstones={cornerstones}
                setCornerstones={setCornerstones}
                roster={roster}
            />
        </div>
    );
}

interface graphicProps {
    cornerstones: Map<string, string[]>;
    graphicComponentClass?: string;
    transparent?: boolean;
}
function GraphicComponent({
    cornerstones,
    graphicComponentClass,
    transparent,
}: graphicProps) {
    const playerData = usePlayerData();
    if (!playerData) return <></>;
    return (
        <div
            className={`${styles.graphicComponent} ${
                graphicComponentClass ?? ''
            } ${transparent ? '' : styles.background}`}
        >
            <div className={styles.positions}>
                {FANTASY_POSITIONS.map(pos => (
                    <div className={styles.column} key={pos}>
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
                                        <div key={player.player_id}>
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

interface selectorProps {
    cornerstones: Map<string, string[]>;
    setCornerstones: (value: SetStateAction<Map<string, string[]>>) => void;
    roster?: Roster;
}

function AllPositionalSelectors({
    cornerstones,
    setCornerstones,
    roster,
}: selectorProps) {
    return (
        <>
            {FANTASY_POSITIONS.map(pos => (
                <PlayerSelectComponent
                    key={pos}
                    playerIds={roster?.players ?? []}
                    selectedPlayerIds={cornerstones.get(pos) ?? []}
                    position={pos}
                    onChange={(newPlayerIds: string[]) => {
                        cornerstones.set(pos, newPlayerIds);
                        setCornerstones(new Map(cornerstones));
                    }}
                />
            ))}
        </>
    );
}

export {CornerstoneModule, GraphicComponent, AllPositionalSelectors};
