import {useEffect, useState} from 'react';
import {Roster} from '../../../../../sleeper-api/sleeper-api';
import PlayerSelectComponent from '../../../shared/PlayerSelectComponent';
import styles from './CornerstonesModule.module.css';
import {useAdpData, usePlayerData} from '../../../../../hooks/hooks';
import {positionToColor} from '../../consts/colors';
import {mapToFullTeamName} from '../../consts/nflTeamNames';
import {nflSilhouette, teamSilhouettes} from '../../../../../consts/images';
import ExportButton from '../../../shared/ExportButton';

interface CornerstonesModuleProps {
    roster?: Roster;
    teamName?: string;
}

export const NONE_PLAYER_ID = 'None';

export function useCornerstones(roster?: Roster) {
    const [cornerstones, setCornerstones] = useState<string[]>([]);
    const playerData = usePlayerData();
    const {sortByAdp} = useAdpData();
    useEffect(() => {
        if (!roster || !playerData) return;
        setCornerstones(
            roster.players
                .map(p => playerData[p])
                .filter(p => !!p)
                .sort(sortByAdp)
                .map(p => p.player_id)
                .slice(0, 4)
        );
    }, [roster, playerData]);
    return {cornerstones, setCornerstones};
}

export default function CornerstonesModule(props: CornerstonesModuleProps) {
    const {roster, teamName} = props;
    const {cornerstones, setCornerstones} = useCornerstones(roster);

    return (
        <>
            <ExportButton
                className={styles.graphicComponent}
                pngName={`${teamName}_cornerstones.png`}
            />
            <InputComponent
                playerIds={roster?.players ?? []}
                cornerstones={cornerstones}
                setCornerstones={setCornerstones}
            />
            <GraphicComponent cornerstones={cornerstones} />
        </>
    );
}
interface GraphicComponentProps {
    cornerstones: string[];
    graphicClassName?: string;
}

export function GraphicComponent({
    cornerstones,
    graphicClassName,
}: GraphicComponentProps) {
    const playerData = usePlayerData();
    const {getPositionalAdp} = useAdpData();
    function cornerstoneTile(playerId?: string) {
        if (!playerData || !playerId) return <></>;
        const defaultPlayer = {
            position: 'none',
            team: '',
            player_id: NONE_PLAYER_ID,
            first_name: '',
            last_name: 'N/A',
            number: 0,
        };
        const player =
            playerId !== NONE_PLAYER_ID ? playerData[playerId] : defaultPlayer;
        const position = player.position;
        const teamLogo = teamSilhouettes.get(player.team);
        return (
            <div
                className={styles.cornerstoneTile}
                style={{
                    background: positionToColor[position],
                }}
            >
                {!!teamLogo && (
                    <img src={teamLogo} className={styles.teamLogo} />
                )}
                <img
                    src={
                        player.player_id === NONE_PLAYER_ID
                            ? nflSilhouette
                            : `https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`
                    }
                    onError={({currentTarget}) => {
                        currentTarget.onerror = null;
                        currentTarget.src =
                            'https://sleepercdn.com/images/v2/icons/player_default.webp';
                    }}
                    className={styles.headshot}
                />
                {player.player_id !== NONE_PLAYER_ID && (
                    <div className={styles.positionalAdp}>
                        {player.position}{' '}
                        {getPositionalAdp(
                            `${player.first_name} ${player.last_name}`
                        )}
                    </div>
                )}
                <div
                    className={styles.tileText}
                    style={
                        player.player_id === NONE_PLAYER_ID
                            ? {color: 'black'}
                            : {}
                    }
                >
                    <div className={styles.firstName}>
                        {player.first_name.toLocaleUpperCase()}
                    </div>
                    <div className={styles.lastName}>
                        {player.last_name.toLocaleUpperCase()}
                    </div>
                    <div className={styles.teamName}>
                        {mapToFullTeamName.get(player.team)}
                    </div>
                    {player.player_id !== NONE_PLAYER_ID && (
                        <div className={styles.number}># {player.number}</div>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className={`${styles.graphicComponent} ${graphicClassName ?? ''}`}>
            <div className={styles.graphicRow}>
                {cornerstoneTile(cornerstones[0])}
                {cornerstoneTile(cornerstones[1])}
            </div>
            <div className={styles.graphicRow}>
                {cornerstoneTile(cornerstones[2])}
                {cornerstoneTile(cornerstones[3])}
            </div>
        </div>
    );
}
interface InputComponentProps {
    playerIds: string[];
    cornerstones: string[];
    setCornerstones: (newCornerstones: string[]) => void;
}
export function InputComponent(props: InputComponentProps) {
    const {playerIds, cornerstones, setCornerstones} = props;
    return (
        <PlayerSelectComponent
            playerIds={playerIds}
            nonIdPlayerOptions={[NONE_PLAYER_ID]}
            selectedPlayerIds={cornerstones}
            onChange={setCornerstones}
            label="Cornerstones"
        />
    );
}
