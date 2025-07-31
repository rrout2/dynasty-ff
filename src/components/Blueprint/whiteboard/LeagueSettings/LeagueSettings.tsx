import {QB} from '../../../../consts/fantasy';
import styles from './LeagueSettings.module.css';

type LeagueSettingsProps = {
    rosterSettings: Map<string, number>;
};

// Sample component. Populate with actual content.
export default function LeagueSettings({rosterSettings}: LeagueSettingsProps) {
    return (
        <div className={styles.leagueSettingsFiller}>
            <div>Sample LeagueSettings</div>
            <div>QB Spots: {rosterSettings.get(QB)}</div>
        </div>
    );
}
