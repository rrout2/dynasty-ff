import {Player, Roster} from '../../../../../sleeper-api/sleeper-api';
import styles from './Starters.module.css';
import {
    BuySellVerdict,
    useBuySellData,
    useLeagueIdFromUrl,
    usePlayerData,
    useProjectedLineup,
    useRosterSettingsFromId,
    useTitle,
} from '../../../../../hooks/hooks';
import ExportButton from '../../../shared/ExportButton';
import {logoImage} from '../../../shared/Utilities';
import PlayerSelectComponent from '../../../shared/PlayerSelectComponent';
import {
    RB,
    TE,
    WR,
    WR_RB_FLEX,
    WR_TE_FLEX,
    SUPER_FLEX,
    FLEX,
    FLEX_SET,
    SUPER_FLEX_SET,
} from '../../../../../consts/fantasy';
import {
    domainShield,
    mGreenLight,
    oRedLight,
    vYellowLight,
} from '../../../../../consts/images';

function StartersModule(props: {
    roster?: Roster;
    teamName?: string;
    graphicComponentClass?: string;
}) {
    const {roster, teamName, graphicComponentClass} = props;
    useTitle('Starters - Blueprint Generator');
    const [leagueId] = useLeagueIdFromUrl();
    const rosterSettings = useRosterSettingsFromId(leagueId);
    const {startingLineup, setStartingLineup} = useProjectedLineup(
        rosterSettings,
        roster?.players
    );

    return (
        <>
            {!graphicComponentClass && (
                <ExportButton
                    className={styles.graphicComponent}
                    pngName={`${teamName}_starters.png`}
                />
            )}
            <InputComponent
                startingLineup={startingLineup}
                setStartingLineup={setStartingLineup}
                roster={roster}
            />
            <StartersGraphic
                startingLineup={startingLineup}
                transparent={false}
                graphicComponentClass={graphicComponentClass}
            />
        </>
    );
}

function InputComponent(props: {
    startingLineup: Lineup;
    setStartingLineup: React.Dispatch<React.SetStateAction<Lineup>>;
    roster?: Roster;
}) {
    const {startingLineup, setStartingLineup, roster} = props;
    const playerData = usePlayerData();

    if (!playerData) return <></>;

    function isPlayerInPosition(player: Player, position: string) {
        switch (position) {
            case WR_RB_FLEX:
                return player.position === WR || player.position === RB;
            case WR_TE_FLEX:
                return player.position === WR || player.position === TE;
            case FLEX:
                return FLEX_SET.has(player.position);
            case SUPER_FLEX:
                return SUPER_FLEX_SET.has(player.position);
            default:
                return !!player && player.position === position;
        }
    }

    return (
        <>
            {startingLineup.map(({player, position}, idx) => {
                return (
                    <PlayerSelectComponent
                        key={idx}
                        playerIds={(roster?.players ?? [])
                            .map(p => playerData[p])
                            .filter(p => !!p)
                            .filter(p => isPlayerInPosition(p, position))
                            .map(p => p.player_id)}
                        selectedPlayerIds={[player.player_id]}
                        onChange={([newPlayerId]: string[]) => {
                            setStartingLineup((oldLineup: Lineup) => {
                                const newLineup = [...oldLineup];
                                newLineup[idx] = {
                                    player: playerData[newPlayerId],
                                    position: position,
                                };
                                return newLineup;
                            });
                        }}
                        multiple={false}
                        maxSelections={1}
                        label={position}
                    />
                );
            })}
        </>
    );
}

export type Lineup = {
    player: Player;
    position: string;
}[];

function StartersGraphic(props: {
    startingLineup?: Lineup;
    transparent?: boolean;
    graphicComponentClass?: string;
    infinite?: boolean;
    weekly?: boolean;
}) {
    const {
        startingLineup,
        transparent,
        graphicComponentClass,
        infinite,
        weekly,
    } = props;

    return (
        <div
            className={`${styles.graphicComponent} ${
                graphicComponentClass ?? ''
            } ${transparent ? '' : styles.background}`}
        >
            {startingLineup?.map(({player, position}, idx) => {
                return (
                    <PlayerRow
                        key={idx}
                        player={player}
                        position={position}
                        infinite={infinite}
                        weekly={weekly}
                    />
                );
            })}
        </div>
    );
}

export function PlayerRow({
    player,
    position,
    infinite,
    weekly,
}: {
    player: Player;
    position: string;
    infinite?: boolean;
    weekly?: boolean;
}) {
    const {getVerdict} = useBuySellData();
    let diplayPosition = position;
    if (position === 'WRRB_FLEX' || position === 'REC_FLEX') {
        diplayPosition = 'FLEX';
    }
    if (position === 'SUPER_FLEX') {
        diplayPosition = 'SF';
    }

    const fullName = `${player.first_name} ${player.last_name}`;
    const displayName =
        fullName.length >= 19
            ? `${player.first_name[0]}. ${player.last_name}`
            : fullName;
    const team = player.team ?? 'FA';

    if (infinite && weekly) {
        throw new Error('cannot render both infinite and weekly');
    }

    return (
        <div className={styles.playerTargetBody}>
            <div className={`${styles.positionChip} ${styles[diplayPosition]}`}>
                {diplayPosition}
            </div>
            {player.player_id && logoImage(team, styles.teamLogo)}
            <div className={styles.targetName}>{displayName}</div>
            {!infinite && !weekly && (
                <div
                    className={styles.subtitle}
                >{`${player.position} - ${team}`}</div>
            )}
            {infinite && player.player_id && (
                <DifferenceChip verdict={getVerdict(fullName)} />
            )}
            {weekly && player.player_id && <StopLights />}
        </div>
    );
}

function StopLights() {
    return (
        <div className={styles.stopLights}>
            <img src={mGreenLight} className={styles.stopLight} />
            <img src={oRedLight} className={styles.stopLight} />
            <img src={vYellowLight} className={styles.stopLight} />
        </div>
    );
}

function DifferenceChip({verdict}: {verdict?: BuySellVerdict}) {
    let color = 'gray';
    let plusMinus = '';
    if (verdict?.verdict.includes('Buy')) {
        color = '#8DC63F';
        plusMinus = '+';
    } else if (verdict?.verdict.includes('Sell')) {
        color = '#EF4136';
        plusMinus = '-';
    } else {
        color = '#F3C01D';
        plusMinus = '=';
    }
    return (
        <div className={styles.differenceChip} style={{color: color}}>
            <img src={domainShield} className={styles.domainShield} />
            {plusMinus && <div>{plusMinus}</div>}
        </div>
    );
}

export {StartersModule, StartersGraphic, InputComponent};
