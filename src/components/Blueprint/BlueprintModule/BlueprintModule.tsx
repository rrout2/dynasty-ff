import {useEffect, useState} from 'react';
import styles from './BlueprintModule.module.css';
import DomainDropdown from '../shared/DomainDropdown';
import {pprIcon, sfIcon, teamsIcon, tepIcon} from '../../../consts/images';
import {
    useAdpData,
    useFetchRosters,
    useGetPicks,
    useLeague,
    useLeagueIdFromUrl,
    usePlayerData,
    usePositionalGrades,
    useRosterSettingsFromId,
    useTeamIdFromUrl,
} from '../../../hooks/hooks';
import {QB, RB, SUPER_FLEX, TE, WR} from '../../../consts/fantasy';
import {
    getAllUsers,
    Player,
    Roster,
    User,
} from '../../../sleeper-api/sleeper-api';
import {NONE_TEAM_ID} from '../../../consts/urlParams';
import {
    getDisplayName,
    TeamSelectComponent,
} from '../../Team/TeamPage/TeamPage';
import {get} from 'http';
import {calculateDepthScore} from '../v1/modules/DepthScore/DepthScore';

const PCT_OPTIONS = [
    '15%',
    '20%',
    '25%',
    '30%',
    '35%',
    '40%',
    '45%',
    '50%',
    '55%',
    '60%',
    '65%',
    '70%',
    '75%',
    '80%',
    '85%',
    '90%',
    '95%',
    '100%',
];

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function BlueprintModule() {
    const [leagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [roster, setRoster] = useState<Roster>();
    const [rosterPlayers, setRosterPlayers] = useState<Player[]>([]);
    const playerData = usePlayerData();
    const {sortByAdp, getPositionalAdp} = useAdpData();
    const league = useLeague(leagueId);
    const rosterSettings = useRosterSettingsFromId(leagueId);
    const rosterSettingsHasSuperFlex = rosterSettings.has(SUPER_FLEX);
    const [numTeams, setNumTeams] = useState(12);
    const {
        overall,
        setOverall,
        qb,
        setQb,
        rb,
        setRb,
        wr,
        setWr,
        te,
        setTe,
        depth,
        setDepth,
    } = usePositionalGrades(roster, numTeams);
    const [draftCapitalScore, setDraftCapitalScore] = useState(8);
    const [flexScore, setFlexScore] = useState(8);
    const [sfScore, setSfScore] = useState(8);
    const [isSuperFlex, setIsSuperFlex] = useState(true);
    const [ppr, setPpr] = useState(0.5);
    const [tep, setTep] = useState(0.5);
    const [productionShare, setProductionShare] = useState('15%');
    const [valueShare, setValueShare] = useState('25%');
    const {myPicks} = useGetPicks(leagueId, roster?.owner_id);

    useEffect(() => {
        if (!league) return;
        setPpr(league.scoring_settings.rec);
        setTep(league.scoring_settings.bonus_rec_te);
        setNumTeams(league.total_rosters);
    }, [league]);
    useEffect(() => {
        setIsSuperFlex(rosterSettingsHasSuperFlex);
    }, [rosterSettingsHasSuperFlex]);
    useEffect(() => {
        if (!leagueId || !rosters) return;
        const ownerIds = new Set(rosters.map(r => r.owner_id));
        getAllUsers(leagueId).then(users =>
            // filter to users included in owners.
            // some leagues have users with no associated owner I think.
            setAllUsers(users.filter(u => ownerIds.has(u.user_id)))
        );
    }, [leagueId, rosters]);
    useEffect(() => {
        if (!allUsers.length || !hasTeamId() || +teamId >= allUsers.length) {
            return;
        }
        setSpecifiedUser(allUsers?.[+teamId]);
    }, [allUsers, teamId]);
    useEffect(() => {
        if (!allUsers.length || !hasTeamId()) return;
        if (+teamId >= allUsers.length) {
            // if the teamId is out of bounds, reset it
            setTeamId('0');
        }
    }, [allUsers, teamId]);
    useEffect(() => {
        if (
            !rosters ||
            rosters.length === 0 ||
            !hasTeamId() ||
            !playerData ||
            allUsers.length === 0
        ) {
            return;
        }
        function getRosterFromTeamIdx(idx: number) {
            if (allUsers.length === 0 || !rosters) return;
            const ownerId = allUsers[idx].user_id;
            return rosters.find(r => r.owner_id === ownerId);
        }
        if (+teamId >= allUsers.length) return;
        const newRoster = getRosterFromTeamIdx(+teamId);
        if (!newRoster) throw new Error('roster not found');
        setRoster(newRoster);
    }, [rosters, teamId, playerData, allUsers]);
    useEffect(() => {
        if (!roster || !playerData) return;
        setRosterPlayers(
            roster?.players
                .map(playerId => playerData[playerId])
                .sort(sortByAdp)
        );
    }, [roster, playerData, sortByAdp]);

    function hasTeamId() {
        return teamId !== '' && teamId !== NONE_TEAM_ID;
    }

    return (
        <div>
            <div className={styles.dropdownContainer}>
                <div className={styles.teamSelect}>
                    <div className={styles.teamSelectTitle}>TEAM</div>
                    <DomainDropdown
                        options={allUsers.map(u => getDisplayName(u))}
                        value={getDisplayName(specifiedUser)}
                        onChange={e => {
                            const {
                                target: {value},
                            } = e;
                            allUsers.forEach((u, idx) => {
                                if (getDisplayName(u) === value) {
                                    setSpecifiedUser(u);
                                    setTeamId(idx.toString());
                                }
                            });
                        }}
                        style={{width: '350px'}}
                    />
                </div>
                <DomainDropdown
                    label={
                        <div className={styles.labels}>
                            <img src={teamsIcon} className={styles.icons} />
                            TEAMS
                        </div>
                    }
                    options={[8, 10, 12, 14, 16, 18, 20]}
                    value={numTeams}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setNumTeams(value as number);
                    }}
                />
                <DomainDropdown
                    label={
                        <div className={styles.labels}>
                            <img src={sfIcon} className={styles.icons} />
                            SF?
                        </div>
                    }
                    options={['YES', 'NO']}
                    value={isSuperFlex ? 'YES' : 'NO'}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setIsSuperFlex((value as string) === 'YES');
                    }}
                />
                <DomainDropdown
                    label={
                        <div className={styles.labels}>
                            <img src={pprIcon} className={styles.icons} />
                            PPR
                        </div>
                    }
                    options={[0, 0.5, 1.0, 1.5, 2]}
                    value={ppr}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setPpr(value as number);
                    }}
                />
                <DomainDropdown
                    label={
                        <div className={styles.labels}>
                            <img src={tepIcon} className={styles.icons} />
                            TEP
                        </div>
                    }
                    options={[0.5, 1.0, 1.5, 2]}
                    value={tep}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setTep(value as number);
                    }}
                />
                <DomainDropdown
                    label={
                        <div style={{width: '40px'}} className={styles.labels}>
                            PROD. SHARE
                        </div>
                    }
                    options={PCT_OPTIONS}
                    value={productionShare}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setProductionShare(value as string);
                    }}
                />
                <DomainDropdown
                    label={
                        <div style={{width: '40px'}} className={styles.labels}>
                            VALUE SHARE
                        </div>
                    }
                    options={PCT_OPTIONS}
                    value={valueShare}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setValueShare(value as string);
                    }}
                />
            </div>
            {roster && (
                <div className={styles.rosterContainer}>
                    <div className={styles.positionContainer}>
                        <div
                            className={`${styles.positionTitle} ${styles.qbTitle}`}
                        >
                            QUARTERBACKS
                        </div>
                        <div className={styles.playersColumn}>
                            {rosterPlayers
                                .filter(p => p.position === QB)
                                .map((p, idx) => {
                                    const fullName = `${p.first_name} ${p.last_name}`;
                                    return (
                                        <div
                                            key={idx}
                                            className={styles.player}
                                        >
                                            <div>{fullName}</div>
                                            <div className={styles.adp}>
                                                {getPositionalAdp(fullName)}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    <DomainDropdown
                        options={GRADE_OPTIONS}
                        value={qb}
                        onChange={e => {
                            const {
                                target: {value},
                            } = e;
                            if (value) {
                                setQb(value as number);
                            }
                        }}
                        outlineColor={'#E84D57'}
                    />
                    <div className={styles.positionContainer}>
                        <div
                            className={`${styles.positionTitle} ${styles.rbTitle}`}
                        >
                            Running Backs
                        </div>
                        <div className={styles.playersColumn}>
                            {rosterPlayers
                                .filter(p => p.position === RB)
                                .map((p, idx) => {
                                    const fullName = `${p.first_name} ${p.last_name}`;
                                    return (
                                        <div
                                            key={idx}
                                            className={styles.player}
                                        >
                                            <div>{fullName}</div>
                                            <div className={styles.adp}>
                                                {getPositionalAdp(fullName)}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    <DomainDropdown
                        options={GRADE_OPTIONS}
                        value={rb}
                        onChange={e => {
                            const {
                                target: {value},
                            } = e;
                            if (value) {
                                setRb(value as number);
                            }
                        }}
                        outlineColor={'rgba(40, 171, 226, 1)'}
                    />
                    <div className={styles.positionContainer}>
                        <div
                            className={`${styles.positionTitle} ${styles.wrTitle}`}
                        >
                            Wide Receivers
                        </div>
                        <div className={styles.playersColumn}>
                            {rosterPlayers
                                .filter(p => p.position === WR)
                                .map((p, idx) => {
                                    const fullName = `${p.first_name} ${p.last_name}`;
                                    return (
                                        <div
                                            key={idx}
                                            className={styles.player}
                                        >
                                            <div>{fullName}</div>
                                            <div className={styles.adp}>
                                                {getPositionalAdp(fullName)}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    <DomainDropdown
                        options={GRADE_OPTIONS}
                        value={wr}
                        onChange={e => {
                            const {
                                target: {value},
                            } = e;
                            if (value) {
                                setWr(value as number);
                            }
                        }}
                        outlineColor={'rgb(26, 224, 105)'}
                    />
                    <div className={styles.positionContainer}>
                        <div
                            className={`${styles.positionTitle} ${styles.teTitle}`}
                        >
                            Tight Ends
                        </div>
                        <div className={styles.playersColumn}>
                            {rosterPlayers
                                .filter(p => p.position === TE)
                                .map((p, idx) => {
                                    const fullName = `${p.first_name} ${p.last_name}`;
                                    return (
                                        <div
                                            key={idx}
                                            className={styles.player}
                                        >
                                            <div>{fullName}</div>
                                            <div className={styles.adp}>
                                                {getPositionalAdp(fullName)}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    <DomainDropdown
                        options={GRADE_OPTIONS}
                        value={te}
                        onChange={e => {
                            const {
                                target: {value},
                            } = e;
                            if (value) {
                                setTe(value as number);
                            }
                        }}
                        outlineColor={'rgb(250, 191, 74)'}
                    />
                    <div className={styles.positionContainer}>
                        <div
                            className={`${styles.positionTitle} ${styles.picksTitle}`}
                        >
                            Picks
                        </div>
                        <div className={styles.playersColumn}>
                            {myPicks.map((p, idx) => {
                                return (
                                    <div key={idx} className={styles.player}>
                                        {p.pick_name}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className={styles.scoreContainer}>
                        <DomainDropdown
                            label={<div className={styles.labels}>DC</div>}
                            options={GRADE_OPTIONS}
                            value={draftCapitalScore}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setDraftCapitalScore(value as number);
                                }
                            }}
                            outlineColor={'rgb(252, 71, 26)'}
                        />
                        <DomainDropdown
                            label={<div className={styles.labels}>FLEX</div>}
                            options={GRADE_OPTIONS}
                            value={flexScore}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setFlexScore(value as number);
                                }
                            }}
                            outlineColor={'rgb(180, 217, 228)'}
                        />
                        <DomainDropdown
                            label={<div className={styles.labels}>SF</div>}
                            options={GRADE_OPTIONS}
                            value={sfScore}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setSfScore(value as number);
                                }
                            }}
                            outlineColor={'rgb(180, 217, 228)'}
                        />
                        <DomainDropdown
                            label={<div className={styles.labels}>BN</div>}
                            options={GRADE_OPTIONS}
                            value={depth}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setDepth(value as number);
                                }
                            }}
                            outlineColor={'#CD1CFD'}
                        />
                        <DomainDropdown
                            label={<div className={styles.labels}>OVERALL</div>}
                            options={GRADE_OPTIONS}
                            value={overall}
                            onChange={e => {
                                const {
                                    target: {value},
                                } = e;
                                if (value) {
                                    setOverall(value as number);
                                }
                            }}
                            outlineColor={'#B4D9E4'}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
