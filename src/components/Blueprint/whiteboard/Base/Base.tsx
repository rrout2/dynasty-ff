import styles from './Base.module.css';
import LeagueSettings from '../LeagueSettings/LeagueSettings';
import {blankblueprint} from '../../../../consts/images';
import {
    useLeagueIdFromUrl,
    useRosterSettingsFromId,
} from '../../../../hooks/hooks';
export default function Base() {
    const [leagueId] = useLeagueIdFromUrl();
    const rosterSettings = useRosterSettingsFromId(leagueId);
    return (
        <div className={styles.fullWhiteboard}>
            {/* adjust leagueSettings in Base.module.css to adjust location on background */}
            <div className={styles.leagueSettings}>
                <LeagueSettings rosterSettings={rosterSettings} />
            </div>
            {/* replace blankblueprint with blank whiteboard image */}
            <img src={blankblueprint} className={styles.base} />
        </div>
    );
}
