import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Roster} from '../../../../../sleeper-api/sleeper-api';
import styles from './SuggestedMovesModule.module.css';
import {useAdpData, usePlayerData} from '../../../../../hooks/hooks';
import PlayerSelectComponent from '../../../shared/PlayerSelectComponent';
import {
    InputComponent as PlayersToTargetInput,
    isRookiePickId,
    rookiePickIdToString,
} from '../../../BlueprintGenerator/modules/playerstotarget/PlayersToTargetModule';
import {positionToColor} from '../../consts/colors';
import {mapToFullTeamName} from '../../consts/nflTeamNames';
import ExportButton from '../../../shared/ExportButton';
import {FANTASY_POSITIONS} from '../../../../../consts/fantasy';
import {nflLogo} from '../../../../../consts/images';
export type SuggestedMovesModuleProps = {
    roster?: Roster;
    teamName?: string;
};

export function useBuySells(roster: Roster | undefined) {
    const [sells, setSells] = useState<string[]>([]);
    const [buys, setBuys] = useState<string[]>([
        '10229',
        '5849',
        '4866',
        '10859',
        '11565',
        '11638',
    ]);
    const playerData = usePlayerData();
    const {sortByAdp} = useAdpData();
    useEffect(() => {
        if (!roster || !playerData) return;
        setSells(
            roster.players
                .map(p => playerData[p])
                .filter(p => !!p)
                .sort(sortByAdp)
                .map(p => p.player_id)
                .slice(0, 3)
        );
    }, [roster, playerData]);

    return {sells, setSells, buys, setBuys};
}

export default function SuggestedMovesModule({
    roster,
    teamName,
}: SuggestedMovesModuleProps) {
    const {sells, setSells, buys, setBuys} = useBuySells(roster);

    return (
        <>
            <ExportButton
                className={styles.graphicComponent}
                pngName={`${teamName}_suggestedmoves.png`}
            />
            <InputComponent
                playerIds={roster?.players ?? []}
                sells={sells}
                setSells={setSells}
                buys={buys}
                setBuys={setBuys}
            />
            <GraphicComponent sells={sells} buys={buys} />
        </>
    );
}

export interface GraphicComponentProps {
    sells: string[];
    buys: string[];
    graphicClassName?: string;
}
export function GraphicComponent({
    sells,
    buys,
    graphicClassName,
}: GraphicComponentProps) {
    return (
        <div className={`${styles.graphicComponent} ${graphicClassName || ''}`}>
            {sells.length > 0 &&
                sells.map((s, idx) => (
                    <div key={idx} className={styles.buySellColumn}>
                        <SellTile playerId={s} />
                        {idx * 2 < buys.length && (
                            <BuyTile playerId={buys[idx * 2]} />
                        )}
                        {idx * 2 + 1 < buys.length && (
                            <BuyTile playerId={buys[idx * 2 + 1]} />
                        )}
                    </div>
                ))}
        </div>
    );
}
type miniPlayer = {
    first_name: string;
    last_name: string;
    position: string;
    sport: string;
    team: string;
    player_id: string;
    espn_id?: string;
};
function SellTile({playerId}: {playerId: string}) {
    const playerData = usePlayerData();
    const {getPositionalAdp} = useAdpData();
    let player = playerData?.[playerId] as miniPlayer;

    if (!player) {
        console.warn(`Player ${playerId} not found in player data`);
        if (isRookiePickId(playerId)) {
            player = {
                first_name: '',
                last_name: playerId,
                position: 'none',
                sport: 'nfl',
                team: 'TBD',
                player_id: playerId,
            };
        } else {
            return <></>;
        }
    }

    return (
        <div
            className={styles.sellTile}
            style={{background: positionToColor[player.position]}}
        >
            <div className={styles.sellLabelCol}>
                <div className={styles.sellLabel}>&#8594;&nbsp;SELL</div>
            </div>
            <div className={styles.sellTileText}>
                {FANTASY_POSITIONS.includes(player.position) && (
                    <div className={styles.positionalAdp}>
                        {player.position}&nbsp;
                        {getPositionalAdp(
                            `${player.first_name} ${player.last_name}`
                        )}
                    </div>
                )}
                <div className={styles.playerName}>
                    {player.first_name} {player.last_name}
                </div>
                <div className={styles.teamName}>
                    {mapToFullTeamName.get(player.team)}
                </div>
            </div>
            <div style={{width: '70px', height: '100%'}} />
        </div>
    );
}

function BuyTile({playerId}: {playerId: string}) {
    const playerData = usePlayerData();
    const {getPositionalAdp} = useAdpData();

    let player = playerData?.[playerId] as miniPlayer;

    if (!player) {
        console.warn(`Player ${playerId} not found in player data`);
        if (isRookiePickId(playerId)) {
            player = {
                first_name: '',
                last_name: rookiePickIdToString(playerId),
                position: 'none',
                sport: 'nfl',
                team: 'TBD',
                player_id: playerId,
            };
        } else {
            return null;
        }
    }

    function getImageSrc(player: miniPlayer) {
        if (isRookiePickId(player.player_id)) {
            return nflLogo;
        }
        return `https://sleepercdn.com/content/nfl/players/${player.player_id}.jpg`;
    }
    return (
        <div className={styles.buyTileContainer}>
            <div className={styles.buyTileColumn}>
                <div
                    className={styles.buyTile}
                    style={{
                        background: positionToColor[player.position],
                    }}
                >
                    {FANTASY_POSITIONS.includes(player.position) && (
                        <div className={styles.positionalAdp}>
                            {player.position}&nbsp;
                            {getPositionalAdp(
                                `${player.first_name} ${player.last_name}`
                            )}
                        </div>
                    )}
                    <div className={styles.playerName}>
                        {player.first_name} {player.last_name}
                    </div>
                    <div className={styles.teamName}>
                        {mapToFullTeamName.get(player.team)}
                    </div>
                </div>
            </div>
            <img className={styles.playerImg} src={getImageSrc(player)} />
            <div className={styles.buyLabel}>BUY</div>
        </div>
    );
}
export interface InputComponentProps {
    playerIds: string[];
    sells: string[];
    setSells: (newSells: string[]) => void;
    buys: string[];
    setBuys: (newBuys: string[]) => void;
}
export function InputComponent(props: InputComponentProps) {
    const {playerIds, sells, setSells, buys, setBuys} = props;
    const nonIdPlayerOptions: string[] = [];
    for (let i = 1; i < 15; i++) {
        nonIdPlayerOptions.push(`Rookie Pick 1.${i < 10 ? `0${i}` : `${i}`}`);
    }
    nonIdPlayerOptions.push('2025 1st');
    nonIdPlayerOptions.push('2026 1st');

    return (
        <div style={{display: 'flex', flexDirection: 'column', width: '500px'}}>
            <PlayerSelectComponent
                playerIds={playerIds}
                nonIdPlayerOptions={nonIdPlayerOptions}
                selectedPlayerIds={sells}
                onChange={setSells}
                label="Sells"
            />
            <PlayersToTargetInput
                playerSuggestions={buys}
                setPlayerSuggestions={
                    setBuys as Dispatch<SetStateAction<string[]>>
                }
                label="Buy"
            />
        </div>
    );
}