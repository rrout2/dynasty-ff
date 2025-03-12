import styles from './RookieDraft.module.css';
import {blankRookie} from '../../../../consts/images';
import {useEffect, useState} from 'react';
import {Archetype} from '../../v1/modules/BigBoy/BigBoy';
import {
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
} from '@mui/material';
import {ARCHETYPE_TO_IMAGE, Outlook} from '../../Live/Live';
import {
    useFetchRosters,
    useLeagueIdFromUrl,
    useTeamIdFromUrl,
} from '../../../../hooks/hooks';
import {
    getAllUsers,
    getTeamName,
    User,
} from '../../../../sleeper-api/sleeper-api';
import {NONE_TEAM_ID} from '../../../../consts/urlParams';
import {TeamSelectComponent} from '../../../Team/TeamPage/TeamPage';
export default function RookieDraft() {
    const [leagueId] = useLeagueIdFromUrl();
    const [teamId, setTeamId] = useTeamIdFromUrl();
    const {data: rosters} = useFetchRosters(leagueId);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [specifiedUser, setSpecifiedUser] = useState<User>();
    const [outlooks, setOutlooks] = useState<string[]>(['', '', '']);
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
            {
                <RookieDraftGraphic
                    archetype={archetype}
                    teamName={getTeamName(specifiedUser)}
                    outlooks={outlooks}
                />
            }
        </div>
    );
}

type RookieDraftGraphicProps = {
    archetype: Archetype | '';
    teamName: string;
    outlooks: string[];
};

function RookieDraftGraphic({
    archetype,
    teamName,
    outlooks,
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
            <img src={blankRookie} />
        </div>
    );
}
