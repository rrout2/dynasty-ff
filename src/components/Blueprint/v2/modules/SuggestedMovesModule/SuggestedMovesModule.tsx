import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {Player, Roster} from '../../../../../sleeper-api/sleeper-api';
import styles from './SuggestedMovesModule.module.css';
import {useAdpData, usePlayerData} from '../../../../../hooks/hooks';
import PlayerSelectComponent from '../../../shared/PlayerSelectComponent';
import {InputComponent as PlayersToTargetInput} from '../../../BlueprintGenerator/modules/playerstotarget/PlayersToTargetModule';
import {positionToColor} from '../../consts/colors';
import {mapToFullTeamName} from '../../consts/nflTeamNames';
export type SuggestedMovesModuleProps = {
    roster?: Roster;
    teamName?: string;
};

export default function SuggestedMovesModule({
    roster,
    teamName,
}: SuggestedMovesModuleProps) {
    const [sells, setSells] = useState<string[]>([]);
    const [buys, setBuys] = useState<string[]>([
        '10229',
        '5849',
        '4866',
        '10859',
        '4866',
        '10859',
    ]);
    return (
        <>
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
}
export function GraphicComponent({sells, buys}: GraphicComponentProps) {
    const playerData = usePlayerData();
    const {getPositionalAdp} = useAdpData();
    function sellTile(playerId: string) {
        if (!playerData) return <></>;
        const player = playerData[playerId];
        if (!player) return <></>;
        return (
            <div
                className={styles.sellTile}
                style={{
                    background: positionToColor[player.position],
                }}
            >
                <div className={styles.sellLabelCol}>
                    <div className={styles.sellLabel}>&#8594;&nbsp;SELL</div>
                </div>
                <div className={styles.sellTileText}>
                    <div className={styles.positionalAdp}>
                        {player.position}&nbsp;
                        {getPositionalAdp(
                            `${player.first_name} ${player.last_name}`
                        )}
                    </div>
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

    function buyTile(playerId: string) {
        if (!playerData) return <></>;
        const player = playerData[playerId];
        if (!player) return <></>;
        return (
            <div
                className={styles.buyTile}
                style={{
                    background: positionToColor[player.position],
                }}
            >
                <div className={styles.positionalAdp}>
                    {player.position}&nbsp;
                    {getPositionalAdp(
                        `${player.first_name} ${player.last_name}`
                    )}
                </div>
                <div className={styles.playerName}>
                    {player.first_name} {player.last_name}
                </div>
                <div className={styles.teamName}>
                    {mapToFullTeamName.get(player.team)}
                </div>
            </div>
        );
    }
    return (
        <>
            {sells.map(s => sellTile(s))}
            {buys.map(b => buyTile(b))}
        </>
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
    const playerData = usePlayerData();

    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <PlayerSelectComponent
                playerIds={playerIds}
                selectedPlayerIds={sells}
                onChange={setSells}
                label="Sells"
            />
            <PlayersToTargetInput
                playerSuggestions={buys}
                setPlayerSuggestions={
                    setBuys as Dispatch<SetStateAction<string[]>>
                }
                label="Buys"
            />
        </div>
    );
}
