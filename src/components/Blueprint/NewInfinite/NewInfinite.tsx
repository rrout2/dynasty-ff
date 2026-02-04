import {CSSProperties, useEffect, useState} from 'react';
import styles from './NewInfinite.module.css';
import {
    bakeryCard2 as bakeryCard,
    domainShield,
    newInfiniteBg,
    nflSilhouette,
} from '../../../consts/images';
import {
    RosterPlayer,
    useBlueprint,
    useNewInfiniteBuysSells,
    useParamFromUrl,
} from '../../../hooks/hooks';
import {BLUEPRINT_ID} from '../../../consts/urlParams';
import {PositionalGradeDisc} from '../NewV1/NewV1';
import {logoImage} from '../shared/Utilities';
import {NONE_PLAYER_ID} from '../v2/modules/CornerstonesModule/CornerstonesModule';
import {
    FLEX,
    QB,
    RB,
    SUPER_FLEX,
    TE,
    WR,
    WR_RB_FLEX,
    WR_TE_FLEX,
} from '../../../consts/fantasy';
import {getApiStartingLineup} from '../BlueprintModule/BlueprintModule';
import {LineChart} from '@mui/x-charts/LineChart';
import ExportButton from '../shared/ExportButton';

export default function NewInfinite({blueprintId}: {blueprintId?: string}) {
    const [blueprintIdFromUrl] = useParamFromUrl(BLUEPRINT_ID);

    return (
        <>
            <ExportButton className={styles.fullBlueprint} />
            <WrappedNewInfinite
                blueprintId={blueprintId || blueprintIdFromUrl}
            />
        </>
    );
}

export function WrappedNewInfinite({blueprintId}: {blueprintId: string}) {
    const {blueprint} = useBlueprint(blueprintId);
    const [apiStartingLineup, setApiStartingLineup] = useState<
        {player: RosterPlayer; position: string}[]
    >([]);
    const [qbGrade, setQbGrade] = useState(0);
    const [rbGrade, setRbGrade] = useState(0);
    const [wrGrade, setWrGrade] = useState(0);
    const [teGrade, setTeGrade] = useState(0);
    const [draftCapitalScore, setDraftCapitalScore] = useState(0);
    const [benchScore, setBenchScore] = useState(0);
    const [benchString, setBenchString] = useState('');
    const [buyPercent, setBuyPercent] = useState(0);
    const [sellPercent, setSellPercent] = useState(0);
    const [holdPercent, setHoldPercent] = useState(0);
    const [tradeNeedleRotationDegrees, setTradeNeedleRotationDegrees] =
        useState(0);
    const {buys, sells} = useNewInfiniteBuysSells(blueprint);
    const [risers, setRisers] = useState<string[]>([]);
    const [fallers, setFallers] = useState<string[]>([]);

    useEffect(() => {
        if (!blueprint) return;
        setApiStartingLineup(
            getApiStartingLineup(
                blueprint.leagueSettings,
                blueprint.rosterPlayers
            )
        );
        setQbGrade(
            blueprint.positionalGrades.find(p => p.position === QB)?.grade || 0
        );
        setRbGrade(
            blueprint.positionalGrades.find(p => p.position === RB)?.grade || 0
        );
        setWrGrade(
            blueprint.positionalGrades.find(p => p.position === WR)?.grade || 0
        );
        setTeGrade(
            blueprint.positionalGrades.find(p => p.position === TE)?.grade || 0
        );
        setDraftCapitalScore(
            blueprint.positionalGrades.find(p => p.position === 'DRAFT_CAPITAL')
                ?.grade || 0
        );
        setBenchScore(
            blueprint.positionalGrades.find(p => p.position === 'BENCH')
                ?.grade || 0
        );

        setBuyPercent(blueprint.infiniteFeatures.buysPercentage);
        setSellPercent(blueprint.infiniteFeatures.sellsPercentage);
        setHoldPercent(blueprint.infiniteFeatures.holdsPercentage);

        setRisers(blueprint.infiniteFeatures.risers.map(p => p.playerName));
        setFallers(blueprint.infiniteFeatures.fallers.map(p => p.playerName));

        const activity = blueprint.infiniteFeatures.recommendedTradeActivity;
        let rotationDegrees = 0;
        switch (activity) {
            case 'High':
                rotationDegrees = 75;
                break;
            case 'MidHigh':
                rotationDegrees = 40;
                break;
            case 'Medium':
                rotationDegrees = 0;
                break;
            case 'MidLow':
                rotationDegrees = -40;
                break;
            case 'Low':
                rotationDegrees = -75;
                break;
        }
        setTradeNeedleRotationDegrees(rotationDegrees);
    }, [blueprint]);

    useEffect(() => {
        if (!blueprint?.rosterPlayers || !apiStartingLineup.length) return;
        setBenchString(
            blueprint.rosterPlayers
                .filter(
                    p =>
                        !apiStartingLineup.find(
                            s => s.player.playerId === p.playerId
                        )
                )
                .map(p => `${shortenName(p.playerName)} (${p.rosterPosition})`)
                .join(', ')
                .toUpperCase()
        );
    }, [apiStartingLineup, blueprint?.rosterPlayers]);

    const [currentDate] = useState(new Date());

    return (
        <div className={styles.fullBlueprint}>
            <div className={styles.teamName}>{blueprint?.teamName}</div>
            <div className={styles.monthYear}>
                {currentDate.toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                })}
            </div>
            <div className={styles.risers}>
                {risers.map((r, i) => (
                    <div key={i}>{r}</div>
                ))}
            </div>
            <div className={styles.fallers}>
                {fallers.map((f, i) => (
                    <div key={i}>{f}</div>
                ))}
            </div>
            <div className={styles.rosterValueTierSection}>
                <RosterValueTier
                    valueTier={
                        (blueprint?.infiniteFeatures.rosterValueTier ??
                            ValueTier.None) as ValueTier
                    }
                />
            </div>
            <PositionalGradeDisc
                grade={qbGrade}
                color={'#DB2335'}
                style={{
                    left: '652px',
                    top: '553px',
                    transform: 'scale(1.63)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={rbGrade}
                color={'#00B1FF'}
                style={{
                    left: '780px',
                    top: '553px',
                    transform: 'scale(1.63)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={wrGrade}
                color={'#1AE069'}
                style={{
                    left: '905.5px',
                    top: '553px',
                    transform: 'scale(1.63)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={teGrade}
                color={'#FFCD00'}
                style={{
                    left: '1032px',
                    top: '553px',
                    transform: 'scale(1.63)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={benchScore}
                color={'#CD00FF'}
                style={{
                    left: '1160px',
                    top: '553px',
                    transform: 'scale(1.63)',
                    transformOrigin: 'top left',
                }}
            />
            <PositionalGradeDisc
                grade={draftCapitalScore}
                color={'#FF4200'}
                style={{
                    left: '1286px',
                    top: '553px',
                    transform: 'scale(1.63)',
                    transformOrigin: 'top left',
                }}
            />
            <div className={styles.ageTracker}>
                <LineChart
                    slotProps={{
                        tooltip: {
                            hidden: true,
                        },
                    }}
                    xAxis={[
                        {
                            data: ['FEB'],
                            scaleType: 'band',
                        },
                    ]}
                    series={[
                        {
                            data: [
                                blueprint?.infiniteFeatures.positionalAgeData.find(
                                    g => g.position === QB
                                )?.averageAge ?? 0,
                            ],
                            color: '#FF0019',
                            id: QB,
                        },
                        {
                            data: [
                                blueprint?.infiniteFeatures.positionalAgeData.find(
                                    g => g.position === RB
                                )?.averageAge ?? 0,
                            ],
                            color: '#00B1FF',
                            id: RB,
                        },
                        {
                            data: [
                                blueprint?.infiniteFeatures.positionalAgeData.find(
                                    g => g.position === WR
                                )?.averageAge ?? 0,
                            ],
                            color: '#1AE069',
                            id: WR,
                        },
                        {
                            data: [
                                blueprint?.infiniteFeatures.positionalAgeData.find(
                                    g => g.position === TE
                                )?.averageAge ?? 0,
                            ],
                            color: '#FFCD00',
                            id: TE,
                        },
                    ]}
                    width={540}
                    height={400}
                    sx={{
                        // styling the axis line
                        '& .MuiChartsAxis-line': {
                            stroke: '#ffffff !important',
                        },
                        // styling the tick marks
                        '& .MuiChartsAxis-tick': {
                            stroke: '#ffffff !important',
                        },
                        // styling the text labels
                        '& .MuiChartsAxis-tickLabel': {
                            fill: '#ffffff !important',
                            fontFamily: 'Acumin Pro ExtraCondensed !important',
                        },
                        '& .MuiMarkElement-series-QB': {
                            fill: '#FF0019',
                        },
                        '& .MuiMarkElement-series-RB': {
                            fill: '#00B1FF',
                        },
                        '& .MuiMarkElement-series-WR': {
                            fill: '#1AE069',
                        },
                        '& .MuiMarkElement-series-TE': {
                            fill: '#FFCD00',
                        },
                    }}
                />
            </div>
            <div className={styles.startingLineup}>
                {apiStartingLineup.map(lineupPlayer => (
                    <PlayerRow
                        key={lineupPlayer.player.id}
                        position={lineupPlayer.position}
                        playerName={lineupPlayer.player.playerName}
                        playerTeam={lineupPlayer.player.teamAbbreviation}
                        sleeperId={lineupPlayer.player.playerSleeperBotId}
                        valueChangeIndicator={
                            lineupPlayer.player.valueChangeIndicator
                        }
                    />
                ))}
            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="61"
                height="61"
                viewBox="0 0 61 61"
                fill="none"
                className={styles.tradeMeterCircle}
            >
                <circle cx="30.5" cy="30.5" r="30.5" fill="black" />
            </svg>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="43"
                height="245"
                viewBox="0 0 43 245"
                fill="none"
                className={styles.tradeMeterNeedle}
                style={{
                    transform: `rotate(${tradeNeedleRotationDegrees}deg)`,
                }}
            >
                <path d="M20.7412 0L0 245H43L20.7412 0Z" fill="black" />
            </svg>
            <div
                className={styles.buySellHoldPercents}
                style={{top: '1130px', left: '1230px'}}
            >
                {`BUYS: ${buyPercent}%`}
            </div>
            <div
                className={styles.buySellHoldPercents}
                style={{top: '1130px', left: '1520px'}}
            >
                {`SELLS: ${sellPercent}%`}
            </div>
            <div
                className={styles.buySellHoldPercents}
                style={{top: '1130px', left: '1375px'}}
            >
                {`HOLDS: ${holdPercent}%`}
            </div>
            {buys.length > 0 && (
                <div className={styles.buysContainer}>
                    <div className={styles.buysColumn}>
                        <BuySellPlayer {...buys[0]} />
                        {buys[1] && <BuySellPlayer {...buys[1]} />}
                    </div>
                    <div className={styles.buysColumn}>
                        {buys[2] && <BuySellPlayer {...buys[2]} />}
                        {buys[3] && <BuySellPlayer {...buys[3]} />}
                    </div>
                </div>
            )}
            {sells.length > 0 && (
                <div
                    className={styles.sellsContainer}
                    style={{left: sells.length > 1 ? undefined : '700px'}}
                >
                    <BuySellPlayer {...sells[0]} />
                    {sells[1] && <BuySellPlayer {...sells[1]} />}
                </div>
            )}
            <div className={styles.benchString}>{benchString}</div>
            <img src={bakeryCard} className={styles.bakeryCard} />
            <img src={newInfiniteBg} className={styles.blankBp} />
        </div>
    );
}

export function verdictToEnum(verdict: string): BuySell {
    switch (verdict) {
        case 'SOFT BUY':
        case 'SoftBuy':
            return BuySell.SoftBuy;
        case 'HARD BUY':
        case 'HardBuy':
            return BuySell.HardBuy;
        case 'HOLD':
        case 'Hold':
            return BuySell.Hold;
        case 'SOFT SELL':
        case 'SoftSell':
            return BuySell.SoftSell;
        case 'HARD SELL':
        case 'HardSell':
            return BuySell.HardSell;
        default:
            return BuySell.Hold;
    }
}

enum ValueTier {
    None = 'None',
    Elite = 'Elite',
    Championship = 'Championship',
    Contending = 'Contending',
    Reload = 'Reload',
    Rebuild = 'Rebuild',
}

function RosterValueTier({valueTier}: {valueTier: ValueTier}) {
    return (
        <div className={styles.rosterValueTier}>
            {Object.values(ValueTier)
                .filter(va => va !== ValueTier.None)
                .map((va, i) => (
                    <div key={i} className={styles.valueArchetypeRow}>
                        {va === valueTier && <GreenArrow />}
                        <div
                            key={i}
                            className={styles.valueArchetype}
                            style={
                                va === valueTier
                                    ? {
                                          color: '#1AE069',
                                          background:
                                              'rgba(26, 224, 105, 0.10)',
                                          outline: '1.9px solid #1AE069',
                                          borderRadius: '10px',
                                          lineHeight: 'normal',
                                          paddingBottom: '5px',
                                          paddingLeft: '5px',
                                          paddingRight: '5px',
                                      }
                                    : {}
                            }
                        >
                            {va}
                        </div>
                    </div>
                ))}
        </div>
    );
}

const GreenArrow = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="27"
        height="31"
        viewBox="0 0 27 31"
        fill="none"
        className={styles.greenArrow}
    >
        <path
            d="M27 15.1555L-1.42741e-06 30.3109L-1.02484e-07 1.12176e-05L27 15.1555Z"
            fill="#1AE069"
        />
    </svg>
);

function shortenName(name: string) {
    return name
        .split(' ')
        .map((word, idx) => (idx === 0 ? `${word[0]}.` : word))
        .join(' ');
}

enum BuySell {
    SoftBuy = 'Soft Buy',
    HardBuy = 'Hard Buy',
    SoftSell = 'Soft Sell',
    HardSell = 'Hard Sell',
    Hold = 'Hold',
}

export type BuySellPlayerProps = {
    playerRowProps: PlayerRowProps;
    buySell: BuySell;
};

function BuySellPlayer({playerRowProps, buySell}: BuySellPlayerProps) {
    function getBackground() {
        switch (buySell) {
            case BuySell.HardBuy:
                return 'linear-gradient(90deg, #008D38 0%, #0F1 100%)';
            case BuySell.SoftBuy:
                return 'linear-gradient(90deg, #1AE069 0%, #55E349 100%)';
            case BuySell.HardSell:
                return 'linear-gradient(90deg, #D9233D 0%, #DB2354 100%)';
            case BuySell.SoftSell:
                return 'linear-gradient(90deg, #EABA10 0%, #FF4200 100%)';
            case BuySell.Hold:
                return 'none';
        }
    }
    return (
        <div className={styles.buySellPlayer}>
            <div
                className={styles.buySell}
                style={{
                    background: getBackground(),
                }}
            >
                {buySell}
            </div>
            <PlayerRow {...playerRowProps} />
        </div>
    );
}

type PlayerRowProps = {
    position: string;
    playerName: string;
    playerTeam: string;
    sleeperId: string;
    valueChangeIndicator?: number; // if undefined, don't show. But 0 is fine (HOLD).
};

function PlayerRow({
    position,
    playerName,
    playerTeam,
    sleeperId,
    valueChangeIndicator,
}: PlayerRowProps) {
    function getCircleStyling(pos: string): CSSProperties {
        switch (pos) {
            case QB:
                return {
                    backgroundColor: '#DB2335',
                };
            case RB:
                return {backgroundColor: '#00B1FF'};
            case WR:
                return {backgroundColor: '#00FF06'};
            case TE:
                return {backgroundColor: '#FFBC00'};
            case FLEX:
            case WR_RB_FLEX:
            case WR_TE_FLEX:
                return {
                    background:
                        'conic-gradient(from 270deg, #EABA10, #00B1FF, #1AE069, #EABA10)',
                };
            case SUPER_FLEX:
                return {
                    background:
                        'conic-gradient(from 270deg, #EABA10, #DB2335, #00B1FF, #1AE069, #EABA10)',
                };
        }
        return {
            backgroundColor: 'white',
        };
    }

    function getCardStyling(pos: string): CSSProperties {
        switch (pos) {
            case QB:
                return {
                    background: ' rgba(219, 35, 53, 0.25)',
                    outline: '2px solid rgba(219, 35, 53, 1)',
                };
            case RB:
                return {
                    background: ' rgba(0, 177, 255, 0.25)',
                    outline: '2px solid rgba(0, 177, 255, 1)',
                };
            case WR:
                return {
                    background: ' rgba(26, 224, 105, 0.25)',
                    outline: '2px solid #00FF06',
                };
            case TE:
                return {
                    background: ' rgba(250, 191, 74, 0.25)',
                    outline: '2px solid rgba(250, 191, 74, 1)',
                };
            case FLEX:
            case WR_RB_FLEX:
            case WR_TE_FLEX:
                return {
                    background:
                        'linear-gradient(90deg, rgba(0, 177, 255, 0.40) 0.02%, rgba(26, 224, 105, 0.40) 51.45%, rgba(234, 186, 16, 0.40) 99.81%)',
                    outline: '2px solid white',
                };
            case SUPER_FLEX:
                return {
                    background:
                        'linear-gradient(90deg, rgba(227, 24, 55, 0.40) 0.02%, rgba(0, 177, 255, 0.40) 37.52%, rgba(26, 224, 105, 0.40) 63.47%, rgba(234, 186, 16, 0.40) 99.81%)',
                    outline: '2px solid white',
                };
        }
        return {
            backgroundColor: 'white',
        };
    }

    function getDifferenceColor() {
        if (valueChangeIndicator && valueChangeIndicator > 0) {
            return 'rgba(26, 224, 105, 1)';
        } else if (valueChangeIndicator && valueChangeIndicator < 0) {
            return 'rgba(227, 24, 55, 1)';
        } else {
            return '#EABA10';
        }
    }

    function getDifferenceSymbol() {
        if (valueChangeIndicator && valueChangeIndicator > 0) {
            return '+';
        } else if (valueChangeIndicator && valueChangeIndicator < 0) {
            return '-';
        } else {
            return '=';
        }
    }

    function abbreviatePosition(pos: string) {
        switch (pos) {
            case FLEX:
            case WR_RB_FLEX:
            case WR_TE_FLEX:
                return 'FL';
            case SUPER_FLEX:
                return 'SF';
        }
        return pos;
    }
    return (
        <div className={styles.playerRow}>
            <div className={styles.playerCard} style={getCardStyling(position)}>
                <div
                    className={styles.position}
                    style={getCircleStyling(position)}
                >
                    {abbreviatePosition(position)}
                </div>
                {logoImage(playerTeam, styles.teamLogo)}
                <img
                    src={
                        sleeperId === NONE_PLAYER_ID
                            ? nflSilhouette
                            : `https://sleepercdn.com/content/nfl/players/${sleeperId}.jpg`
                    }
                    onError={({currentTarget}) => {
                        currentTarget.onerror = null;
                        currentTarget.src =
                            'https://sleepercdn.com/images/v2/icons/player_default.webp';
                    }}
                    className={styles.headshot}
                />
                <div className={styles.playerName}>{playerName}</div>
            </div>
            {valueChangeIndicator !== undefined && (
                <div
                    className={styles.differenceChip}
                    style={{color: getDifferenceColor()}}
                >
                    <img src={domainShield} className={styles.domainShield} />
                    <div className={styles.marketDiscrepancy}>
                        {getDifferenceSymbol()}
                    </div>
                    {valueChangeIndicator !== 0 && (
                        <div className={styles.marketDiscrepancy}>
                            {Math.abs(valueChangeIndicator)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
