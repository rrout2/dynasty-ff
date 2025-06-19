import styles from './LookToTradeModule.module.css';
import ExportButton from '../../../shared/ExportButton';
import {Roster} from '../../../../../sleeper-api/sleeper-api';
import {usePlayerData} from '../../../../../hooks/hooks';
import {Dispatch, Fragment, SetStateAction, useState} from 'react';
import PlayerSelectComponent from '../../../shared/PlayerSelectComponent';
import {Autocomplete, FormControl, TextField} from '@mui/material';

const SUGGESTIONS = [
    'Bellcow',
    'Better DC',
    'Certainty',
    'Consistency',
    'Cornerstone Asset',
    'Developmental Asset',
    'Diversify Team Investment',
    'Downtier',
    'Downtier/Rushing QB',
    'Elite TE',
    'Higher Ceiling',
    'Higher Upside',
    'Other Position',
    'Pivot',
    'Proven Asset',
    'QB',
    'RB',
    'Rushing QB',
    'Safer Long Term Asset',
    'Safer Situation',
    'Starting Asset',
    'WR',
    'WR1',
    'WR / RB',
    'Younger Asset',
];

function LookToTradeModule(props: {
    roster?: Roster;
    teamName?: string;
    graphicComponentClass?: string;
}) {
    const {roster, teamName, graphicComponentClass} = props;
    const [playersToTrade, setPlayersToTrade] = useState<string[][]>([
        [],
        [],
        [],
    ]);
    const [inReturn, setInReturn] = useState<string[]>([
        'placeholder',
        'placeholder',
        'placeholder',
    ]);

    return (
        <>
            <div className={styles.body}>
                <GraphicComponent
                    playersToTrade={playersToTrade}
                    inReturn={inReturn}
                    graphicComponentClass={graphicComponentClass}
                    transparent={false}
                />
                <div className={styles.inputComponent}>
                    <InputComponent
                        playersToTrade={playersToTrade}
                        setPlayersToTrade={setPlayersToTrade}
                        inReturn={inReturn}
                        setInReturn={setInReturn}
                        roster={roster}
                    />
                </div>
            </div>
            {!graphicComponentClass && (
                <ExportButton
                    className={styles.graphicComponent}
                    pngName={`${teamName}_looktotrade.png`}
                />
            )}
        </>
    );
}
interface graphicProps {
    playersToTrade: string[][];
    inReturn: string[];
    graphicComponentClass?: string;
    transparent?: boolean;
    hideTitle?: boolean;
}
const COLORS = ['#3CB6E9', '#EC336D', '#8AC73E'];
function GraphicComponent({
    playersToTrade,
    inReturn,
    graphicComponentClass,
    transparent,
    hideTitle,
}: graphicProps) {
    const playerData = usePlayerData();
    if (!playerData) return <></>;

    function tradeSuggestion(
        send: string,
        receive: string,
        color: string,
        idx: number
    ) {
        return (
            <div className={styles.suggestion} key={idx}>
                <div className={styles.send}>
                    <span className={styles.whiteBullet}>◦</span>
                    {send}
                </div>
                <div
                    className={styles.receive}
                    style={{backgroundColor: color}}
                >
                    {receive}
                </div>
            </div>
        );
    }
    const playerIdReducer = (
        acc: string,
        currPlayerId: string,
        idx: number,
        arr: string[]
    ) => {
        let displayValue;
        if (
            idx > 0 &&
            currPlayerId.startsWith('Rookie Pick ') &&
            arr[idx - 1].startsWith('Rookie Pick ')
        ) {
            displayValue = currPlayerId.substring('Rookie Pick '.length);
        } else {
            const player = playerData![currPlayerId];
            displayValue = !player
                ? currPlayerId
                : `${player.first_name} ${player.last_name}`;
        }
        if (idx + 1 !== arr.length) {
            // don't add a slash at the end
            return `${acc}${displayValue}/`;
        }
        return `${acc}${displayValue}`;
    };

    const shortenedPlayerIdReducer = (
        acc: string,
        currPlayerId: string,
        idx: number,
        arr: string[]
    ) => {
        let displayValue;
        if (
            idx > 0 &&
            currPlayerId.startsWith('Rookie Pick ') &&
            arr[idx - 1].startsWith('Rookie Pick ')
        ) {
            displayValue = currPlayerId.substring('Rookie Pick '.length);
        } else {
            const player = playerData![currPlayerId];
            displayValue = !player
                ? currPlayerId
                : `${player.first_name[0]}. ${player.last_name}`;
        }
        if (idx + 1 !== arr.length) {
            // don't add a slash at the end
            return `${acc}${displayValue}/`;
        }
        return `${acc}${displayValue}`;
    };

    return (
        <div
            className={`${styles.graphicComponent} ${
                graphicComponentClass ?? ''
            } ${transparent ? '' : styles.background}`}
        >
            {!hideTitle && <div className={styles.title}>LOOK TO TRADE:</div>}
            {hideTitle && <div className={styles.noTitle} />}
            {[0, 1, 2].map(idx => {
                const tradeAwayString = playersToTrade[idx].reduce(
                    playerIdReducer,
                    ''
                );
                const shortenedTradeAwayString = playersToTrade[idx].reduce(
                    shortenedPlayerIdReducer,
                    ''
                );
                return tradeSuggestion(
                    tradeAwayString.length < 26
                        ? tradeAwayString
                        : shortenedTradeAwayString,
                    inReturn[idx].toLocaleUpperCase(),
                    COLORS[idx],
                    idx
                );
            })}
        </div>
    );
}

interface inputProps {
    playersToTrade: string[][];
    setPlayersToTrade: Dispatch<SetStateAction<string[][]>>;
    inReturn: string[];
    setInReturn: Dispatch<SetStateAction<string[]>>;
    roster?: Roster;
}
function InputComponent({
    playersToTrade,
    setPlayersToTrade,
    roster,
    inReturn,
    setInReturn,
}: inputProps) {
    function inReturnComponent(idx: number) {
        return (
            <FormControl
                style={{
                    margin: '4px',
                }}
            >
                <Autocomplete
                    options={SUGGESTIONS}
                    inputValue={inReturn[idx]}
                    onInputChange={(_event, newInputValue) => {
                        const newInReturn = [...inReturn];
                        newInReturn[idx] = newInputValue;
                        setInReturn(newInReturn);
                    }}
                    renderInput={params => (
                        <TextField {...params} label="Suggestion" />
                    )}
                    freeSolo
                />
            </FormControl>
        );
    }
    function inputComponent() {
        const nonIdPlayerOptions: string[] = [];
        for (let i = 1; i < 15; i++) {
            nonIdPlayerOptions.push(
                `Rookie Pick 1.${i < 10 ? `0${i}` : `${i}`}`
            );
        }
        nonIdPlayerOptions.push('2025 1st');
        nonIdPlayerOptions.push('2026 1st');
        return (
            <>
                {playersToTrade.map((_, idx) => (
                    <Fragment key={idx}>
                        <PlayerSelectComponent
                            playerIds={roster?.players ?? []}
                            selectedPlayerIds={playersToTrade[idx]}
                            onChange={(newPlayerIds: string[]) => {
                                const newSelections = [...playersToTrade];
                                newSelections[idx] = newPlayerIds;
                                setPlayersToTrade(newSelections);
                            }}
                            nonIdPlayerOptions={nonIdPlayerOptions}
                        />
                        {inReturnComponent(idx)}
                    </Fragment>
                ))}
            </>
        );
    }
    return inputComponent();
}

export {LookToTradeModule, GraphicComponent, InputComponent};
