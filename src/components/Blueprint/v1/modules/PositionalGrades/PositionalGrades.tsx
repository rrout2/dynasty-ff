import styles from './PositionalGrades.module.css';
import {Player, Roster} from '../../../../../sleeper-api/sleeper-api';
import ExportButton from '../../../shared/ExportButton';
import {
    InputLabel,
    SelectChangeEvent,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import {
    SUPER_FLEX_SET,
    FANTASY_POSITIONS,
    QB,
    TE,
    RB,
    WR,
} from '../../../../../consts/fantasy';
import {scale, slider} from '../../../../../consts/images';
import {Dispatch, SetStateAction, useState} from 'react';
import {
    PlayerData,
    PlayerValue,
    usePlayerData,
    usePlayerValues,
    usePlayerValuesJson,
} from '../../../../../hooks/hooks';

interface PositionalGradesProps {
    roster?: Roster;
    teamName?: string;
    graphicComponentClass?: string;
    transparent?: boolean;
    leagueSize: number;
    isSuperFlex: boolean;
}

type grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type Thresholds = {
    SF: Map<string, Map<grade, number>>;
    ONE_QB: Map<string, Map<grade, number>>;
};
// from google spreadsheet
const THRESHOLDS: Thresholds = {
    SF: new Map<string, Map<grade, number>>([
        [
            QB,
            new Map<grade, number>([
                [1, 20],
                [2, 35],
                [3, 55],
                [4, 70],
                [5, 85],
                [6, 100],
                [7, 120],
                [8, 145],
                [9, 170],
                [10, 200],
            ]),
        ],
        [
            RB,
            new Map<grade, number>([
                [1, 1],
                [2, 15],
                [3, 33],
                [4, 45],
                [5, 58],
                [6, 72],
                [7, 90],
                [8, 108],
                [9, 126],
                [10, 144],
            ]),
        ],
        [
            WR,
            new Map<grade, number>([
                [1, 0],
                [2, 30],
                [3, 50],
                [4, 70],
                [5, 90],
                [6, 110],
                [7, 130],
                [8, 155],
                [9, 185],
                [10, 225],
            ]),
        ],
    ]),
    ONE_QB: new Map<string, Map<grade, number>>([
        [
            QB,
            new Map<grade, number>([
                [1, 14.275],
                [2, 28.75],
                [3, 43.125],
                [4, 57.5],
                [5, 71.875],
                [6, 86.25],
                [7, 100.625],
                [8, 115],
                [9, 129.375],
                [10, 143.75],
            ]),
        ],
        [
            RB,
            new Map<grade, number>([
                [1, 1],
                [2, 15],
                [3, 33],
                [4, 45],
                [5, 58],
                [6, 72],
                [7, 90],
                [8, 108],
                [9, 126],
                [10, 144],
            ]),
        ],
        [
            WR,
            new Map<grade, number>([
                [1, 0],
                [2, 30],
                [3, 50],
                [4, 70],
                [5, 90],
                [6, 110],
                [7, 130],
                [8, 155],
                [9, 185],
                [10, 225],
            ]),
        ],
    ]),
};

/**
 * Given number starting players = num of teams * num of starters.
 * Small: <= 80
 * Medium: 81 - 119
 * Large: >= 120
 */
function getStarterPoolSizeMultiplier(
    numTeams: number,
    numStarters: number,
    pos: string,
    isSuperFlex: boolean
): number {
    const starterSize = numTeams * numStarters;
    if (isSuperFlex) {
        if (starterSize <= 80) {
            return LEAGUE_SIZE_MULTIPLIERS.SF.SMALL.get(pos)!;
        } else if (starterSize <= 119) {
            return LEAGUE_SIZE_MULTIPLIERS.SF.MEDIUM.get(pos)!;
        } else {
            return LEAGUE_SIZE_MULTIPLIERS.SF.LARGE.get(pos)!;
        }
    } else {
        if (starterSize <= 80) {
            return LEAGUE_SIZE_MULTIPLIERS.ONE_QB.SMALL.get(pos)!;
        } else if (starterSize <= 119) {
            return LEAGUE_SIZE_MULTIPLIERS.ONE_QB.MEDIUM.get(pos)!;
        } else {
            return LEAGUE_SIZE_MULTIPLIERS.ONE_QB.LARGE.get(pos)!;
        }
    }
}
const LEAGUE_SIZE_MULTIPLIERS = {
    SF: {
        SMALL: new Map<string, number>([
            [QB, 0.85],
            [TE, 1],
            [RB, 0.9],
            [WR, 0.9],
        ]),
        MEDIUM: new Map<string, number>([
            [QB, 0.95],
            [TE, 1],
            [RB, 0.95],
            [WR, 0.95],
        ]),
        LARGE: new Map<string, number>([
            [QB, 1],
            [TE, 1],
            [RB, 1],
            [WR, 1],
        ]),
    },
    ONE_QB: {
        SMALL: new Map<string, number>([
            [QB, 0.8],
            [TE, 1],
            [RB, 0.9],
            [WR, 0.9],
        ]),
        MEDIUM: new Map<string, number>([
            [QB, 0.85],
            [TE, 1],
            [RB, 0.95],
            [WR, 0.95],
        ]),
        LARGE: new Map<string, number>([
            [QB, 0.9],
            [TE, 1],
            [RB, 1],
            [WR, 1],
        ]),
    },
};

function PositionalGrades({
    roster,
    teamName,
    graphicComponentClass,
    transparent,
    isSuperFlex,
    leagueSize,
}: PositionalGradesProps) {
    const [overrides, setOverrides] = useState<Map<string, number>>(
        new Map(FANTASY_POSITIONS.map(pos => [pos, -1]))
    );

    return (
        <div>
            {!graphicComponentClass && (
                <ExportButton
                    className={styles.graphicComponent}
                    pngName={`${teamName}_positional_grades.png`}
                />
            )}
            <OverrideComponent
                overrides={overrides}
                setOverrides={setOverrides}
                roster={roster}
                isSuperFlex={isSuperFlex}
                leagueSize={leagueSize}
            />
            <GraphicComponent
                overrides={overrides}
                roster={roster}
                graphicComponentClass={graphicComponentClass}
                transparent={transparent}
                isSuperFlex={isSuperFlex}
                leagueSize={leagueSize}
            />
        </div>
    );
}

interface graphicProps {
    overrides?: Map<string, number>;
    roster?: Roster;
    graphicComponentClass?: string;
    transparent?: boolean;
    numStarters?: number;
    isSuperFlex: boolean;
    leagueSize: number;
}

function GraphicComponent({
    overrides,
    roster,
    graphicComponentClass,
    transparent,
    isSuperFlex,
    leagueSize,
    numStarters,
}: graphicProps) {
    const playerData = usePlayerData();
    const {getPlayerValue} = usePlayerValuesJson();

    function gradeToSliderHeight(grade: number) {
        return grade * 27.5 - 25;
    }

    function scaleAndSliderColumn(grade: number, position: string) {
        if (grade < 0 || grade > 10) {
            console.error(`grade out of range [0, 10]: '${grade}'`);
        }
        return (
            <div className={styles.column} key={position}>
                <div className={styles.scaleAndSlider}>
                    <img src={scale} className={styles.scale} />
                    <img
                        src={slider}
                        className={`${styles.slider}`}
                        style={{
                            bottom: `${gradeToSliderHeight(grade)}px`,
                        }}
                    />
                </div>
                <div className={`${styles.chip} ${styles[position]}`}>
                    {position}
                </div>
                <div className={styles.grade}>
                    {grade}
                    <span className={styles.slash}>/</span>10
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${styles.graphicComponent} ${
                graphicComponentClass ?? ''
            } ${transparent ? '' : styles.background}`}
        >
            {FANTASY_POSITIONS.map(position => {
                let grade = 0;
                if (overrides && overrides.get(position)! >= 0) {
                    grade = overrides.get(position)!;
                } else {
                    grade = gradeByPosition(
                        position,
                        getPlayerValue,
                        isSuperFlex,
                        leagueSize,
                        playerData,
                        roster,
                        numStarters
                    );
                }
                return scaleAndSliderColumn(grade, position);
            })}
        </div>
    );
}

interface overrideProps {
    overrides: Map<string, number>;
    setOverrides: Dispatch<SetStateAction<Map<string, number>>>;
    isSuperFlex: boolean;
    leagueSize: number;
    roster?: Roster;
}

function OverrideComponent({
    overrides,
    setOverrides,
    roster,
    isSuperFlex,
    leagueSize,
}: overrideProps) {
    const playerData = usePlayerData();
    const {getPlayerValue} = usePlayerValues();

    function overrideSelector(pos: string) {
        if (!SUPER_FLEX_SET.has(pos)) {
            throw new Error(`Unknown position '${pos}'`);
        }

        return (
            <FormControl key={pos} style={{margin: '4px'}}>
                <InputLabel>{pos}</InputLabel>
                <Select
                    value={overrides.get(pos)!}
                    label={pos}
                    onChange={(e: SelectChangeEvent<number>) => {
                        const newOverrides = new Map(overrides);
                        if (!e) return;
                        newOverrides.set(pos, +e.target.value);
                        setOverrides(newOverrides);
                    }}
                >
                    <MenuItem value={-1}>
                        None (
                        {gradeByPosition(
                            pos,
                            getPlayerValue,
                            isSuperFlex,
                            leagueSize,
                            playerData,
                            roster
                        )}
                        )
                    </MenuItem>
                    {Array.from({length: 11}, (_, index) => (
                        <MenuItem key={index} value={index}>
                            {index}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
    return <>{FANTASY_POSITIONS.map(pos => overrideSelector(pos))}</>;
}

type scoreAndBump = {
    score: number;
    bump: number;
};

function scoreAndBumpByPosition(
    pos: string,
    getPlayerValue: (playerName: string) => PlayerValue | undefined,
    isSuperFlex: boolean,
    leagueSize: number,
    playerData?: PlayerData,
    roster?: Roster,
    numStarters?: number
): scoreAndBump {
    if (!SUPER_FLEX_SET.has(pos)) {
        throw new Error(`Unknown position '${pos}'`);
    }
    if (pos === TE) {
        throw new Error('Should use manual TE calculation');
    }
    if (!playerData || !roster || !roster.players) return {score: 0, bump: 0};
    let totalBump = 0;

    const multiplier = getStarterPoolSizeMultiplier(
        leagueSize,
        roster?.starters?.length ?? numStarters ?? 0,
        pos,
        isSuperFlex
    );

    return {
        score:
            multiplier *
            roster.players
                .map(playerId => playerData[playerId])
                .filter(
                    player => !!player && player.fantasy_positions.includes(pos)
                )
                .reduce((acc: number, player: Player) => {
                    const fullName = `${player.first_name} ${player.last_name}`;
                    const playerValue = getPlayerValue(fullName);
                    if (!playerValue) {
                        console.warn(
                            `cannot find PlayerValue for player with name = '${fullName}'`
                        );
                        return acc;
                    }
                    if (isSuperFlex) {
                        totalBump += +playerValue.sfBonus;
                    } else {
                        totalBump += +playerValue.oneQbBonus;
                    }
                    return acc + +playerValue.Value;
                }, 0),
        bump: totalBump,
    };
}

export function gradeByPosition(
    pos: string,
    getPlayerValue: (playerName: string) => PlayerValue | undefined,
    isSuperFlex: boolean,
    leagueSize: number,
    playerData?: PlayerData,
    roster?: Roster,
    numStarters?: number
) {
    if (!playerData || !roster || !roster.players) return 0;
    if (pos === TE) {
        return Math.max(
            ...roster.players
                .map(playerId => playerData[playerId])
                .filter(player => !!player)
                .map(
                    player =>
                        getPlayerValue(
                            `${player.first_name} ${player.last_name}`
                        )?.teValue || 0
                )
        );
    }
    const {score, bump} = scoreAndBumpByPosition(
        pos,
        getPlayerValue,
        !!isSuperFlex,
        leagueSize,
        playerData,
        roster,
        numStarters
    );
    // console.log('score', score);
    // console.log('bump', bump);
    if (!SUPER_FLEX_SET.has(pos)) {
        throw new Error(`Unknown position '${pos}'`);
    }

    const thresholdByGrade = isSuperFlex
        ? THRESHOLDS.SF.get(pos)!
        : THRESHOLDS.ONE_QB.get(pos)!;
    if (!thresholdByGrade) {
        throw new Error(`Unknown position '${pos}'`);
    }

    let rawGrade = 0;
    let minDiff = Infinity;
    // Choose the closest grade
    for (let i = 10; i > 0; i--) {
        const diff = Math.abs(score - thresholdByGrade.get(i as grade)!);
        if (diff < minDiff) {
            rawGrade = i;
            minDiff = diff;
        }
    }

    let unbumpedLimit = 10;
    if (pos === QB && !isSuperFlex) {
        unbumpedLimit = 8;
    }
    const cappedGrade = Math.round(Math.min(rawGrade, unbumpedLimit));
    return Math.min(cappedGrade + bump, 10);
}

export {PositionalGrades, GraphicComponent, OverrideComponent};
