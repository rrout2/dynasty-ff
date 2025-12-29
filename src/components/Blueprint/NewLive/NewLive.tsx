import React, {useState} from 'react';
import styles from './NewLive.module.css';
import {blankLive2} from '../../../consts/images';
import {
    OutlookOption,
    PCT_OPTIONS,
    RosterArchetype,
    ValueArchetype,
} from '../BlueprintModule/BlueprintModule';
import {
    OverallGrade,
    PositionalGradeDisc,
    ProductionValueShare,
    RosterArchetypeComponent,
    TwoYearOutlook,
    ValueArchetypeComponent,
} from '../NewV1/NewV1';
import DomainDropdown from '../shared/DomainDropdown';
import DomainTextField from '../shared/DomainTextField';

const GRADE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function NewLive() {
    const [qbGrade, setQbGrade] = useState(5);
    const [rbGrade, setRbGrade] = useState(1);
    const [wrGrade, setWrGrade] = useState(1);
    const [teGrade, setTeGrade] = useState(1);
    const [benchGrade, setBenchGrade] = useState(1);
    const [draftCapitalScore, setDraftCapitalScore] = useState(1);
    const [overallGrade, setOverallGrade] = useState(1);
    const [productionShare, setProductionShare] = useState('15%');
    const [valueShare, setValueShare] = useState('25%');
    const [productionShareRank, setProductionShareRank] = useState(1);
    const [valueShareRank, setValueShareRank] = useState(1);
    const [twoYearOutlook, setTwoYearOutlook] = useState<OutlookOption[]>([
        OutlookOption.Rebuild,
        OutlookOption.Reload,
    ]);
    const [valueArchetype, setValueArchetype] = useState<ValueArchetype>(
        ValueArchetype.None
    );
    const [rosterArchetype, setRosterArchetype] = useState<RosterArchetype>(
        RosterArchetype.None
    );
    return (
        <div className={styles.container}>
            <div className={styles.inputs}>
                <DomainDropdown
                    label={
                        <span className={styles.labels}>Value Archetype</span>
                    }
                    style={{width: '200px'}}
                    options={Object.values(ValueArchetype)}
                    value={valueArchetype}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setValueArchetype(value as ValueArchetype);
                        }
                    }}
                />
                <DomainDropdown
                    label={
                        <span className={styles.labels}>Roster Archetype</span>
                    }
                    style={{width: '200px'}}
                    options={Object.values(RosterArchetype)}
                    value={rosterArchetype}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setRosterArchetype(value as RosterArchetype);
                        }
                    }}
                />
                <DomainDropdown
                    label={<span className={styles.labels}>QB</span>}
                    options={GRADE_OPTIONS}
                    value={qbGrade}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setQbGrade(value as number);
                        }
                    }}
                    outlineColor={'#E84D57'}
                />
                <DomainDropdown
                    label={<span className={styles.labels}>RB</span>}
                    options={GRADE_OPTIONS}
                    value={rbGrade}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setRbGrade(value as number);
                        }
                    }}
                    outlineColor={'#00B1FF'}
                />
                <DomainDropdown
                    label={<span className={styles.labels}>WR</span>}
                    options={GRADE_OPTIONS}
                    value={wrGrade}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setWrGrade(value as number);
                        }
                    }}
                    outlineColor={'#1AE069'}
                />
                <DomainDropdown
                    label={<span className={styles.labels}>TE</span>}
                    options={GRADE_OPTIONS}
                    value={teGrade}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setTeGrade(value as number);
                        }
                    }}
                    outlineColor={'#FFBC00'}
                />
                <DomainDropdown
                    label={<span className={styles.labels}>BN</span>}
                    options={GRADE_OPTIONS}
                    value={benchGrade}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setBenchGrade(value as number);
                        }
                    }}
                    outlineColor={'#CD00FF'}
                />
                <DomainDropdown
                    label={<span className={styles.labels}>DC</span>}
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
                    outlineColor={'#DB2335'}
                />
                {overallGrade > -1 && (
                    <DomainTextField
                        label={
                            <div
                                className={styles.labels}
                                style={{color: '#B4D9E4'}}
                            >
                                OVERALL
                            </div>
                        }
                        value={overallGrade}
                        onChange={e => {
                            let val = +e.target.value;
                            if (Number.isNaN(val)) {
                                console.log(e.target.value, 'is not a number');
                                return;
                            }
                            while (val > 10) {
                                val = val / 10;
                            }
                            setOverallGrade(val);
                        }}
                        outlineColor={'#B4D9E4'}
                        labelMarginRight={'10px'}
                    />
                )}
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
                            PROD. SHARE RANK
                        </div>
                    }
                    options={[
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        17, 18, 19, 20,
                    ]}
                    value={productionShareRank}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setProductionShareRank(value as number);
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
                <DomainDropdown
                    label={
                        <div style={{width: '40px'}} className={styles.labels}>
                            VALUE SHARE RANK
                        </div>
                    }
                    options={[
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        17, 18, 19, 20,
                    ]}
                    value={valueShareRank}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        setValueShareRank(value as number);
                    }}
                />
                <DomainDropdown
                    label={<div className={styles.labels}>1.</div>}
                    style={{width: '250px'}}
                    options={Object.values(OutlookOption)}
                    value={twoYearOutlook[0]}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setTwoYearOutlook([
                                value as OutlookOption,
                                twoYearOutlook[1],
                            ]);
                        }
                    }}
                />
                <DomainDropdown
                    label={<div className={styles.labels}>2.</div>}
                    style={{width: '250px'}}
                    options={Object.values(OutlookOption)}
                    value={twoYearOutlook[1]}
                    onChange={e => {
                        const {
                            target: {value},
                        } = e;
                        if (value) {
                            setTwoYearOutlook([
                                twoYearOutlook[0],
                                value as OutlookOption,
                            ]);
                        }
                    }}
                />
            </div>
            <div className={styles.liveBlueprint}>
                <ValueArchetypeComponent
                    valueArchetype={valueArchetype}
                    style={{
                        left: '70px',
                        top: '70px',
                        fontSize: '44px',
                        width: '350px',
                        textAlign: 'center',
                    }}
                />
                <RosterArchetypeComponent
                    rosterArchetype={rosterArchetype}
                    style={{
                        left: '70px',
                        top: '200px',
                        fontSize: '44px',
                        width: '350px',
                        textAlign: 'center',
                    }}
                />
                <PositionalGradeDisc
                    grade={qbGrade}
                    color={'#DB2335'}
                    style={{
                        left: '80px',
                        top: '345px',
                        transformOrigin: 'top left',
                        scale: '1.45',
                    }}
                />
                <PositionalGradeDisc
                    grade={rbGrade}
                    color={'#00B1FF'}
                    style={{
                        left: '200px',
                        top: '345px',
                        transformOrigin: 'top left',
                        scale: '1.45',
                    }}
                />
                <PositionalGradeDisc
                    grade={wrGrade}
                    color={'#1AE069'}
                    style={{
                        left: '320px',
                        top: '345px',
                        transformOrigin: 'top left',
                        scale: '1.45',
                    }}
                />
                <PositionalGradeDisc
                    grade={teGrade}
                    color={'#FFBC00'}
                    style={{
                        left: '85px',
                        top: '470px',
                        transformOrigin: 'top left',
                        scale: '1.45',
                    }}
                />
                <PositionalGradeDisc
                    grade={benchGrade}
                    color={'#CD00FF'}
                    style={{
                        left: '200px',
                        top: '470px',
                        transformOrigin: 'top left',
                        scale: '1.45',
                    }}
                />
                <PositionalGradeDisc
                    grade={draftCapitalScore}
                    color={'#FF4200'}
                    style={{
                        left: '315px',
                        top: '470px',
                        transformOrigin: 'top left',
                        scale: '1.45',
                    }}
                />
                <OverallGrade
                    overallGrade={overallGrade}
                    style={{right: '105px', top: '605px'}}
                />
                <ProductionValueShare
                    share={productionShare}
                    leagueRank={productionShareRank}
                    style={{
                        left: '70px',
                        top: '770px',
                        transformOrigin: 'top left',
                        scale: '1.4',
                    }}
                    live={true}
                />
                <ProductionValueShare
                    share={valueShare}
                    leagueRank={valueShareRank}
                    style={{
                        left: '290px',
                        top: '770px',
                        transformOrigin: 'top left',
                        scale: '1.4',
                    }}
                    live={true}
                />
                <TwoYearOutlook
                    twoYearOutlook={twoYearOutlook}
                    style={{
                        right: '30px',
                        bottom: '40px',
                        gap: '62px',
                        transformOrigin: 'bottom right',
                        scale: '1.45',
                    }}
                />
                <img src={blankLive2} />
            </div>
        </div>
    );
}
