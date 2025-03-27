import styles from './RookieDraft.module.css';
import {blankRookie, rookieMap} from '../../../../consts/images';
import {Fragment, useEffect, useState} from 'react';
import {Archetype} from '../../v1/modules/BigBoy/BigBoy';
import {
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
    TextField,
} from '@mui/material';
import {ARCHETYPE_TO_IMAGE, Outlook} from '../../Live/Live';
import {
    useFetchRosters,
    useLeague,
    useLeagueIdFromUrl,
    useRoster,
    useRosterSettings,
    useTeamIdFromUrl,
} from '../../../../hooks/hooks';
import {
    getAllUsers,
    getTeamName,
    User,
} from '../../../../sleeper-api/sleeper-api';
import {NONE_TEAM_ID} from '../../../../consts/urlParams';
import {TeamSelectComponent} from '../../../Team/TeamPage/TeamPage';
import {useRosterTierAndPosGrades} from '../../infinite/RosterTier/RosterTier';
import {SUPER_FLEX, QB} from '../../../../consts/fantasy';
import {getPositionalOrder} from '../../infinite/BuySellHold/BuySellHold';

type Verdict = 'downtier' | 'hold' | 'proven asset' | '';

type DraftPick = {
    round: number | '';
    pick: number | '';
    verdict: Verdict;
};

type DraftStrategy = {
    header: string;
    body: string;
}[];

export default function RookieDraft() {
    const [leagueId] = useLeagueIdFromUrl();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettings(league);
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const {roster} = useRoster(rosters, teamId, leagueId);
    const [outlooks, setOutlooks] = useState<string[]>(['', '', '']);
    const [draftPicks, setDraftPicks] = useState<DraftPick[]>([
        {round: 1, pick: 1, verdict: ''},
        {round: 2, pick: 2, verdict: ''},
        {round: 3, pick: 3, verdict: ''},
        {round: 4, pick: 4, verdict: ''},
    ]);
    const isSuperFlex =
        rosterSettings.has(SUPER_FLEX) || (rosterSettings.get(QB) ?? 0) > 1;
    const {qbGrade, rbGrade, wrGrade, teGrade} = useRosterTierAndPosGrades(
        isSuperFlex,
        rosters?.length ?? 0,
        roster
    );
    // 4 picks, 3 targets per pick
    const [rookieTargets, setRookieTargets] = useState<string[][]>([
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ]);
    const [draftStrategy, setDraftStrategy] = useState<DraftStrategy>([
        {
            header: '2nd Round Picks',
            body: 'Draft Strategy Body',
        },
        {
            header: '3rd Round Picks',
            body: 'Draft Strategy Body',
        },
    ]);

    useEffect(() => {
        if (!allUsers.length || !hasTeamId() || +teamId >= allUsers.length) {
            return;
        }
        setSpecifiedUser(allUsers?.[+teamId]);
    }, [allUsers, teamId]);

    useEffect(() => {
        if (!allUsers.length || !hasTeamId()) {
            return;
        }
        if (+teamId >= allUsers.length) {
            // if the teamId is out of bounds, reset it
            setTeamId('0');
        }
    }, [allUsers, teamId]);
    const [archetype, setArchetype] = useState<Archetype | ''>('');
    useEffect(() => {
        if (!leagueId || !rosters) return;
        const ownerIds = new Set(rosters.map(r => r.owner_id));
        getAllUsers(leagueId).then(users =>
            // filter to users included in owners.
            // some leagues have users with no associated owner I think.
            setAllUsers(users.filter(u => ownerIds.has(u.user_id)))
        );
    }, [leagueId, rosters]);

    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    const rounds = [...Array(5).keys()].map(x => x + 1);
    const picks = [...Array(24).keys()].map(x => x + 1);
    const rookieOptions = Array.from(rookieMap.keys());

    return (
        <div>
            {leagueId && (
                <TeamSelectComponent
                    teamId={teamId}
                    setTeamId={setTeamId}
                    allUsers={allUsers}
                    specifiedUser={specifiedUser}
                    style={{
                        margin: '4px',
                        maxWidth: '800px',
                    }}
                />
            )}
            <FormControl className={styles.formControlInput}>
                <InputLabel>Archetype</InputLabel>
                <Select
                    value={archetype}
                    label="Archetype"
                    onChange={(event: SelectChangeEvent) => {
                        setArchetype(event.target.value as Archetype);
                    }}
                >
                    <MenuItem value={''} key={''}>
                        Choose an Archetype:
                    </MenuItem>
                    {Object.values(Archetype).map((arch, idx) => (
                        <MenuItem value={arch} key={idx}>
                            {arch}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {outlooks.map((_, idx) => (
                <FormControl key={idx} className={styles.formControlInput}>
                    <InputLabel>Year {idx + 1}</InputLabel>
                    <Select
                        label={`Year ${idx + 1}`}
                        value={outlooks[idx]}
                        onChange={(event: SelectChangeEvent) => {
                            const newOutlooks = outlooks.slice();
                            newOutlooks[idx] = event.target.value;
                            setOutlooks(newOutlooks);
                        }}
                    >
                        <MenuItem value={''} key={''}>
                            Choose an outlook:
                        </MenuItem>
                        <MenuItem value={'CONTEND'} key={'CONTEND'}>
                            {'CONTEND'}
                        </MenuItem>
                        <MenuItem value={'REBUILD'} key={'REBUILD'}>
                            {'REBUILD'}
                        </MenuItem>

                        <MenuItem value={'RELOAD'} key={'RELOAD'}>
                            {'RELOAD'}
                        </MenuItem>
                    </Select>
                </FormControl>
            ))}
            <div className={styles.draftPickInputColumn}>
                {draftPicks.map((_, idx) => (
                    <div key={idx} className={styles.draftPickInputRow}>
                        <FormControl
                            key={`${idx} round`}
                            style={{width: '120px'}}
                        >
                            <InputLabel>Round {idx + 1}</InputLabel>
                            <Select
                                label={`Round ${idx + 1}`}
                                value={draftPicks[idx].round.toString()}
                                onChange={(event: SelectChangeEvent) => {
                                    const newDraftPicks = draftPicks.slice();
                                    if (event.target.value === '') {
                                        newDraftPicks[idx].round = '';
                                    } else {
                                        newDraftPicks[idx].round =
                                            +event.target.value;
                                    }
                                    setDraftPicks(newDraftPicks);
                                }}
                            >
                                <MenuItem value={''} key={''}>
                                    Choose a round:
                                </MenuItem>
                                {rounds.map(round => (
                                    <MenuItem value={round} key={round}>
                                        {round}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl
                            key={`${idx} pick`}
                            style={{width: '120px'}}
                        >
                            <InputLabel>Pick {idx + 1}</InputLabel>
                            <Select
                                label={`Pick ${idx + 1}`}
                                value={draftPicks[idx].pick.toString()}
                                onChange={(event: SelectChangeEvent) => {
                                    const newDraftPicks = draftPicks.slice();
                                    if (event.target.value === '') {
                                        newDraftPicks[idx].pick = '';
                                    } else {
                                        newDraftPicks[idx].pick =
                                            +event.target.value;
                                    }
                                    setDraftPicks(newDraftPicks);
                                }}
                            >
                                <MenuItem value={''} key={''}>
                                    Choose a pick:
                                </MenuItem>
                                {picks.map(pick => (
                                    <MenuItem value={pick} key={pick}>
                                        {pick}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl
                            key={`${idx} verdict`}
                            style={{width: '140px'}}
                        >
                            <InputLabel>Verdict {idx + 1}</InputLabel>
                            <Select
                                label={`Verdict ${idx + 1}`}
                                value={draftPicks[idx].verdict}
                                onChange={(event: SelectChangeEvent) => {
                                    const newDraftPicks = draftPicks.slice();
                                    const newVerdict = event.target.value;
                                    if (
                                        newVerdict !== 'downtier' &&
                                        newVerdict !== 'hold' &&
                                        newVerdict !== 'proven asset'
                                    ) {
                                        newDraftPicks[idx].verdict = '';
                                    } else {
                                        newDraftPicks[idx].verdict = newVerdict;
                                    }
                                    setDraftPicks(newDraftPicks);
                                }}
                            >
                                <MenuItem value={''} key={''}>
                                    Choose a verdict:
                                </MenuItem>
                                <MenuItem value={'downtier'} key={'downtier'}>
                                    {'downtier'}
                                </MenuItem>
                                <MenuItem value={'hold'} key={'hold'}>
                                    {'hold'}
                                </MenuItem>
                                <MenuItem
                                    value={'proven asset'}
                                    key={'proven asset'}
                                >
                                    {'proven asset'}
                                </MenuItem>
                            </Select>
                        </FormControl>
                        {[0, 1, 2].map(targetIdx => {
                            return (
                                <FormControl
                                    key={`${idx} rookie ${targetIdx}`}
                                    style={{width: '150px'}}
                                >
                                    <InputLabel>
                                        Pick {idx + 1} Target {targetIdx + 1}
                                    </InputLabel>
                                    <Select
                                        label={`Rookie ${idx + 1} Target ${
                                            targetIdx + 1
                                        }`}
                                        value={rookieTargets[idx][targetIdx]}
                                        onChange={(
                                            event: SelectChangeEvent
                                        ) => {
                                            const newRookieTargets =
                                                rookieTargets.slice();
                                            const newTarget =
                                                event.target.value;
                                            newRookieTargets[idx][targetIdx] =
                                                newTarget;
                                            setRookieTargets(newRookieTargets);
                                        }}
                                    >
                                        <MenuItem value={''} key={''}>
                                            Choose a target:
                                        </MenuItem>
                                        {rookieOptions.map(rookie => (
                                            <MenuItem
                                                value={rookie}
                                                key={rookie}
                                            >{`${rookie}`}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className={styles.draftStrategyInputs}>
                {draftStrategy.map((strategy, idx) => (
                    <div key={idx} className={styles.draftStrategyInputColumn}>
                        <TextField
                            value={strategy.header}
                            onChange={e => {
                                const newDraftStrategy = draftStrategy.slice();
                                newDraftStrategy[idx].header = e.target.value;
                                setDraftStrategy(newDraftStrategy);
                            }}
                            key={idx}
                            label={`Draft Strategy Header ${idx + 1}`}
                        />
                        <TextField
                            value={strategy.body}
                            onChange={e => {
                                const newDraftStrategy = draftStrategy.slice();
                                newDraftStrategy[idx].body = e.target.value;
                                setDraftStrategy(newDraftStrategy);
                            }}
                            key={idx}
                            label={`Draft Strategy Body ${idx + 1}`}
                        />
                    </div>
                ))}
            </div>
            <RookieDraftGraphic
                archetype={archetype}
                teamName={getTeamName(specifiedUser)}
                outlooks={outlooks}
                teamNeeds={getPositionalOrder({
                    qbGrade,
                    rbGrade,
                    wrGrade,
                    teGrade,
                })}
                draftPicks={draftPicks}
                rookieTargets={rookieTargets}
                draftStrategy={draftStrategy}
            />
        </div>
    );
}

type RookieDraftGraphicProps = {
    archetype: Archetype | '';
    teamName: string;
    outlooks: string[];
    teamNeeds: ('QB' | 'RB' | 'WR' | 'TE')[];
    draftPicks: DraftPick[];
    rookieTargets: string[][];
    draftStrategy: DraftStrategy;
};

function RookieDraftGraphic({
    archetype,
    teamName,
    outlooks,
    teamNeeds,
    draftPicks,
    rookieTargets,
    draftStrategy,
}: RookieDraftGraphicProps) {
    return (
        <div className={styles.rookieDraftGraphic}>
            <div className={styles.teamName}>{teamName}</div>
            {archetype && (
                <img
                    src={ARCHETYPE_TO_IMAGE.get(archetype)!}
                    className={styles.archetypeImage}
                />
            )}
            {outlooks.map((outlook, idx) => (
                <Outlook
                    key={idx}
                    outlook={outlook}
                    className={styles[`year${idx + 1}`]}
                />
            ))}
            {teamNeeds.map((pos, idx) => (
                <Fragment key={idx}>
                    <div
                        className={`${styles.teamNeed} ${
                            styles[`need${idx + 1}`]
                        }`}
                    >
                        {pos}
                    </div>
                    <div
                        className={`${styles.shadow} ${
                            styles[`shadow${idx + 1}`]
                        }`}
                    />
                </Fragment>
            ))}
            {draftPicks.map((draftPick, idx) => {
                if (!draftPick.round || !draftPick.pick || !draftPick.verdict) {
                    return null;
                }
                return (
                    <Fragment key={idx}>
                        <div
                            className={`${styles.draftPick} ${
                                styles[`draftPick${idx + 1}`]
                            }`}
                        >
                            {draftPick.round}.
                            {draftPick.pick && draftPick.pick < 10 ? '0' : ''}
                            {draftPick.pick}
                        </div>
                        <div
                            className={`${styles.verdict} ${
                                styles[`verdict${idx + 1}`]
                            } ${styles[draftPick.verdict.replace(' ', '')]}`}
                        >
                            {draftPick.verdict.toUpperCase()}
                        </div>
                        <div
                            className={`${styles.target} ${
                                styles[`target${idx + 1}`]
                            }`}
                        >
                            {draftPick.round}.
                            {draftPick.pick && draftPick.pick < 10 ? '0' : ''}
                            {draftPick.pick}
                        </div>
                    </Fragment>
                );
            })}
            {[0, 1, 2, 3].map(idx => {
                return (
                    <div
                        key={idx}
                        className={`${styles.line} ${styles[`line${idx + 1}`]}`}
                    />
                );
            })}
            {rookieTargets.map((pick, pickIdx) =>
                pick.map(
                    (target, targetIdx) =>
                        target && (
                            <img
                                key={`${pickIdx} ${targetIdx}`}
                                className={`${styles.rookieTarget} ${
                                    styles[`rookieTarget${pickIdx + 1}`]
                                } ${
                                    styles[
                                        `rookieTargetRow${
                                            pickIdx < 2
                                                ? targetIdx + 1
                                                : targetIdx + 4
                                        }`
                                    ]
                                }`}
                                src={rookieMap.get(target)}
                            />
                        )
                )
            )}
            {draftStrategy.map((strategy, idx) => (
                <>
                    <div
                        className={`${styles.draftStrategyHeader} ${
                            styles[`draftStrategyHeader${idx + 1}`]
                        }`}
                    >
                        {strategy.header}
                    </div>
                    <div
                        className={`${styles.draftStrategyBody} ${
                            styles[`draftStrategyBody${idx + 1}`]
                        }`}
                    >
                        {strategy.body}
                    </div>
                </>
            ))}
            <img src={blankRookie} />
        </div>
    );
}
