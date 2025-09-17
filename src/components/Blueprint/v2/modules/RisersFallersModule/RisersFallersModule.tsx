import {useEffect, useState} from 'react';
import styles from './RisersFallersModule.module.css';
import {Player, Roster} from '../../../../../sleeper-api/sleeper-api';
import {
    usePlayerData,
    useWeeklyRisersFallers,
} from '../../../../../hooks/hooks';
import PlayerSelectComponent from '../../../shared/PlayerSelectComponent';
import StyledNumberInput from '../../../shared/StyledNumberInput';
import ExportButton from '../../../shared/ExportButton';
import {
    longGreen,
    longRed,
    mediumGreen,
    mediumRed,
    shortGreen,
    shortRed,
} from '../../../../../consts/images';
export type RisersFallersModuleProps = {
    roster?: Roster;
    teamName?: string;
};
export function useRisersFallers(roster?: Roster) {
    const {risers: weeklyRisers, fallers: weeklyFallers} =
        useWeeklyRisersFallers(roster);
    console.log(weeklyRisers, weeklyFallers);
    const [risers, setRisers] = useState<string[]>([]);
    const [riserValues, setRiserValues] = useState<number[]>([30, 20, 10]);
    const [fallers, setFallers] = useState<string[]>([]);
    const [fallerValues, setFallerValues] = useState<number[]>([-10, -20, -30]);
    const playerData = usePlayerData();

    useEffect(() => {
        if (!playerData) return;
        function findPlayerId(playerName: string) {
            if (!playerData) return '';
            const player = Object.values(playerData).find(
                p => `${p.first_name} ${p.last_name}` === playerName
            );
            return player ? player.player_id : '';
        }
        setRisers(weeklyRisers.map(findPlayerId));
        setFallers(weeklyFallers.map(findPlayerId));
    }, [weeklyRisers, weeklyFallers, playerData]);
    return {
        risers,
        setRisers,
        riserValues,
        setRiserValues,
        fallers,
        setFallers,
        fallerValues,
        setFallerValues,
    };
}
export default function RisersFallersModule({
    roster,
    teamName,
}: RisersFallersModuleProps) {
    const {
        risers,
        setRisers,
        riserValues,
        setRiserValues,
        fallers,
        setFallers,
        fallerValues,
        setFallerValues,
    } = useRisersFallers(roster);

    return (
        <div>
            <ExportButton
                className={styles.graphicComponent}
                pngName={`${teamName}_risers_fallers.png`}
            />
            <InputComponent
                playerIds={roster?.players || []}
                risers={risers}
                setRisers={setRisers}
                fallers={fallers}
                setFallers={setFallers}
                riserValues={riserValues}
                setRiserValues={setRiserValues}
                fallerValues={fallerValues}
                setFallerValues={setFallerValues}
            />
            <GraphicComponent
                risers={risers}
                fallers={fallers}
                riserValues={riserValues}
                fallerValues={fallerValues}
            />
        </div>
    );
}

type GraphicComponentProps = {
    risers: string[];
    fallers: string[];
    riserValues: number[];
    fallerValues: number[];
    graphicClassName?: string;
    transparent?: boolean;
};
export function GraphicComponent({
    risers,
    fallers,
    riserValues,
    fallerValues,
    graphicClassName,
    transparent = false,
}: GraphicComponentProps) {
    const playerData = usePlayerData();
    const reds = [shortRed, mediumRed, longRed];
    const greens = [shortGreen, mediumGreen, longGreen].reverse();
    const greenWidths = [72, 60, 42];
    const redWidths = [...greenWidths].reverse();
    for (let i = 0; i < greenWidths.length; i++) {
        greenWidths[i] = greenWidths[i] * 1.6;
        redWidths[i] = redWidths[i] * 1.6;
    }

    if (!playerData) return <></>;

    return (
        <div
            className={`${styles.graphicComponent} ${graphicClassName ?? ''}`}
            style={{backgroundColor: transparent ? 'transparent' : '#005D91'}}
        >
            <div className={`${styles.wholeColumn} ${styles.columnBorder}`}>
                <div
                    className={`${styles.columnSection} ${styles.nameColumn} ${styles.alignFlexEnd}`}
                >
                    {risers.map(playerId => (
                        <div key={playerId}>
                            {maybeShortenedName(playerData[playerId])}
                        </div>
                    ))}
                </div>
                <div
                    className={`${styles.arrowContainer} ${styles.alignFlexEnd}`}
                >
                    <div
                        className={styles.columnSection}
                        style={{width: '100%'}}
                    >
                        {fallerValues.map((value, idx) => (
                            <div key={idx} className={styles.valueAndArrow}>
                                <div></div>
                                <div
                                    className={`${styles.arrowImage} ${styles.alignFlexEnd}`}
                                >
                                    <img
                                        src={reds[idx]}
                                        style={{
                                            width: `${redWidths[idx]}px`,
                                            height: '32px',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles.wholeColumn}>
                <div className={styles.arrowContainer}>
                    <div
                        className={styles.columnSection}
                        style={{width: '100%'}}
                    >
                        {riserValues.map((value, idx) => (
                            <div key={idx} className={styles.valueAndArrow}>
                                <div className={styles.arrowImage}>
                                    <img
                                        src={greens[idx]}
                                        style={{
                                            width: `${greenWidths[idx]}px`,
                                            height: '29px',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`${styles.columnSection} ${styles.nameColumn}`}>
                    {fallers.map(playerId => (
                        <div key={playerId}>
                            {maybeShortenedName(playerData[playerId])}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

type InputComponentProps = {
    playerIds: string[];
    risers: string[];
    setRisers: (risers: string[]) => void;
    fallers: string[];
    setFallers: (fallers: string[]) => void;
    riserValues: number[];
    setRiserValues: (riserValues: number[]) => void;
    fallerValues: number[];
    setFallerValues: (fallerValues: number[]) => void;
};

export function InputComponent({
    playerIds,
    risers,
    setRisers,
    fallers,
    setFallers,
    riserValues,
    setRiserValues,
    fallerValues,
    setFallerValues,
}: InputComponentProps) {
    return (
        <>
            {risers.map((riser, idx) => {
                return (
                    <div className={styles.inputRow} key={idx}>
                        <StyledNumberInput
                            key={idx}
                            value={riserValues[idx]}
                            onChange={(_, value) => {
                                const newRiserValues = [...riserValues];
                                newRiserValues[idx] = value || 0;
                                setRiserValues(newRiserValues);
                            }}
                            min={0}
                            step={0.1}
                        />
                        <PlayerSelectComponent
                            label={`Riser ${idx + 1}`}
                            playerIds={playerIds}
                            selectedPlayerIds={[riser]}
                            onChange={([riser]) => {
                                const newRisers = [...risers];
                                newRisers[idx] = riser;
                                setRisers(newRisers);
                            }}
                            multiple={false}
                        />
                    </div>
                );
            })}
            {fallers.map((faller, idx) => {
                return (
                    <div className={styles.inputRow} key={idx}>
                        <StyledNumberInput
                            value={fallerValues[idx]}
                            onChange={(_, value) => {
                                const newFallerValues = [...fallerValues];
                                newFallerValues[idx] = value || 0;
                                setFallerValues(newFallerValues);
                            }}
                            max={0}
                            step={0.1}
                        />
                        <PlayerSelectComponent
                            label={`Faller ${idx + 1}`}
                            playerIds={playerIds}
                            selectedPlayerIds={[faller]}
                            onChange={([faller]) => {
                                const newFallers = [...fallers];
                                newFallers[idx] = faller;
                                setFallers(newFallers);
                            }}
                            multiple={false}
                        />
                    </div>
                );
            })}
        </>
    );
}

export function maybeShortenedName(player: Player) {
    const fullName = `${player.first_name} ${player.last_name}`;
    if (fullName.length >= 15) {
        return `${player.first_name[0]}. ${player.last_name}`;
    }
    return fullName;
}
