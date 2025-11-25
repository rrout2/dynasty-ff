import {useState} from 'react';
import styles from './BlueprintModule.module.css';
import DomainDropdown from '../shared/DomainDropdown';
import {pprIcon, sfIcon, teamsIcon, tepIcon} from '../../../consts/images';

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

export default function BlueprintModule() {
    const [team, setTeam] = useState('Blitzburgh');
    const [numTeams, setNumTeams] = useState(12);
    const [isSuperFlex, setIsSuperFlex] = useState(true);
    const [ppr, setPpr] = useState(1);
    const [tep, setTep] = useState(0.5);
    const [productionShare, setProductionShare] = useState('15%');
    const [valueShare, setValueShare] = useState('25%');
    return (
        <div>
            <div className={styles.dropdownContainer}>
                <div className={styles.teamSelect}>
                    <div className={styles.teamSelectTitle}>TEAM</div>
                    <DomainDropdown
                        options={[
                            'Blitzburgh',
                            'OPTION 2',
                            'OPTION 3',
                            'MUCH LONGER OPTION NAME',
                        ]}
                        value={team}
                        onChange={e => {
                            const {
                                target: {value},
                            } = e;
                            setTeam(value as string);
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
                    style={{width: '65px'}}
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
                    style={{width: '80px'}}
                />
                <DomainDropdown
                    label={
                        <div className={styles.labels}>
                            <img src={pprIcon} className={styles.icons} />
                            PPR
                        </div>
                    }
                    options={[0.5, 1.0, 1.5, 2]}
                    value={ppr}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setPpr(value as number);
                    }}
                    style={{width: '65px'}}
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
                    style={{width: '70px'}}
                />
                <DomainDropdown
                    label={<div style={{width: '60px'}}>PROD. SHARE</div>}
                    options={PCT_OPTIONS}
                    value={productionShare}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setProductionShare(value as string);
                    }}
                    style={{width: '80px'}}
                />
                <DomainDropdown
                    label={<div>VALUE SHARE</div>}
                    options={PCT_OPTIONS}
                    value={valueShare}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setValueShare(value as string);
                    }}
                    style={{width: '80px'}}
                />
            </div>
            <div className={styles.rosterContainer}>
                <div className={`${styles.positionTitle} ${styles.qbTitle}`}>QUARTERBACKS</div>
                <div className={`${styles.positionTitle} ${styles.rbTitle}`}>RUNNING BACKS</div>
                <div className={`${styles.positionTitle} ${styles.wrTitle}`}>WIDE RECEIVERS</div>
                <div className={`${styles.positionTitle} ${styles.teTitle}`}>TIGHT ENDS</div>
            </div>
        </div>
    );
}
