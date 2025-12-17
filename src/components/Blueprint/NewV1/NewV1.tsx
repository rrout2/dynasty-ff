import styles from './NewV1.module.css';
import {new1_0Background} from '../../../consts/images';
import {
    OutlookOption,
    RosterArchetype,
} from '../BlueprintModule/BlueprintModule';
import {CSSProperties} from 'react';

type NewV1Props = {
    teamName: string;
    numTeams: number;
    isSuperFlex: boolean;
    ppr: number;
    tep: number;
    rosterArchetype: RosterArchetype;
    qbGrade: number;
    rbGrade: number;
    wrGrade: number;
    teGrade: number;
    benchGrade: number;
    draftCapitalScore: number;
    twoYearOutlook: OutlookOption[];
};

export default function NewV1({
    teamName,
    numTeams,
    isSuperFlex,
    ppr,
    tep,
    rosterArchetype,
    qbGrade,
    rbGrade,
    wrGrade,
    teGrade,
    benchGrade,
    draftCapitalScore,
    twoYearOutlook,
}: NewV1Props) {
    return (
        <div className={styles.fullBlueprint}>
            <div className={styles.teamName}>{teamName}</div>
            <NumTeams
                numTeams={numTeams}
                style={{right: '204px', top: '28px'}}
            />
            <IsSuperFlex
                isSuperFlex={isSuperFlex}
                style={{right: '145px', top: '28px'}}
            />
            <Ppr ppr={ppr} style={{right: '86px', top: '28px'}} />
            <Tep tep={tep} style={{right: '27px', top: '28px'}} />
            <RosterArchetypeComponent
                rosterArchetype={rosterArchetype}
                style={{left: '315px', top: '130px'}}
            />
            <TwoYearOutlook
                twoYearOutlook={twoYearOutlook}
                style={{right: '10px', top: '349px'}}
            />
            <RosterGrades
                qbGrade={qbGrade}
                rbGrade={rbGrade}
                wrGrade={wrGrade}
                teGrade={teGrade}
                style={{left: '152px', top: '187px'}}
            />
            <PositionalGradeDisc
                grade={qbGrade}
                color={'#DB2335'}
                style={{left: '65px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={rbGrade}
                color={'#00B1FF'}
                style={{left: '138px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={wrGrade}
                color={'#1AE069'}
                style={{left: '210px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={teGrade}
                color={'#FFBC00'}
                style={{left: '282px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={benchGrade}
                color={'#CD00FF'}
                style={{left: '354px', top: '430px'}}
            />
            <PositionalGradeDisc
                grade={draftCapitalScore}
                color={'#FF4200'}
                style={{left: '426px', top: '430px'}}
            />
            <img src={new1_0Background} className={styles.backgroundImg} />
        </div>
    );
}

export function TwoYearOutlook({
    twoYearOutlook,
    style,
}: {
    twoYearOutlook: OutlookOption[];
    style?: CSSProperties;
}) {
    function getBackgroundColor(outlook: OutlookOption) {
        switch (outlook) {
            case OutlookOption.Contend:
                return 'rgba(26, 224, 105, 0.5)';
            case OutlookOption.Rebuild:
                return 'rgba(232, 77, 87, 0.5)';
            case OutlookOption.Reload:
                return 'rgba(250, 191, 74, 0.5)';
        }
    }
    function getBorderColor(outlook: OutlookOption) {
        switch (outlook) {
            case OutlookOption.Contend:
                return 'rgba(26, 224, 105, 1)';
            case OutlookOption.Rebuild:
                return 'rgba(232, 77, 87,1)';
            case OutlookOption.Reload:
                return 'rgba(250, 191, 74, 1)';
        }
    }
    return (
        <div className={styles.twoYearOutlook} style={style}>
            <div
                className={styles.outlookCard}
                style={{backgroundColor: getBackgroundColor(twoYearOutlook[0]), borderColor: getBorderColor(twoYearOutlook[0])}}
            >
                {twoYearOutlook[0]}
            </div>
            <div
                className={styles.outlookCard}
                style={{backgroundColor: getBackgroundColor(twoYearOutlook[1]), borderColor: getBorderColor(twoYearOutlook[1])}}
            >
                {twoYearOutlook[1]}
            </div>
        </div>
    );
}

export function NumTeams({
    numTeams,
    style,
}: {
    numTeams: number;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.numTeams} style={style}>
            {numTeams}
        </div>
    );
}

export function IsSuperFlex({
    isSuperFlex,
    style,
}: {
    isSuperFlex: boolean;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.isSuperFlex} style={style}>
            {isSuperFlex ? 'Y' : 'N'}
        </div>
    );
}
export function Ppr({ppr, style}: {ppr: number; style?: CSSProperties}) {
    return (
        <div className={styles.ppr} style={style}>
            {ppr}
        </div>
    );
}

export function Tep({tep, style}: {tep: number; style?: CSSProperties}) {
    return (
        <div className={styles.tep} style={style}>
            {tep}
        </div>
    );
}

export function RosterArchetypeComponent({
    rosterArchetype,
    style,
}: {
    rosterArchetype: RosterArchetype;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.rosterArchetype} style={style}>
            {rosterArchetype}
        </div>
    );
}

export function RosterGrades({
    qbGrade,
    rbGrade,
    wrGrade,
    teGrade,
    style,
}: {
    qbGrade: number;
    rbGrade: number;
    wrGrade: number;
    teGrade: number;
    style?: CSSProperties;
}) {
    return (
        <div className={styles.rosterGrades} style={style}>
            <div className={styles.rosterGrade}>{qbGrade}</div>
            <div className={styles.rosterGrade}>{rbGrade}</div>
            <div className={styles.rosterGrade}>{wrGrade}</div>
            <div className={styles.rosterGrade}>{teGrade}</div>
        </div>
    );
}

export function PositionalGradeDisc({
    grade,
    color,
    style,
}: {
    grade: number;
    color: string;
    style?: CSSProperties;
}) {
    return (
        <div style={style} className={styles.positionalGradeDisc}>
            <div className={styles.positionalGradeDiscInner}>
                <div className={styles.pie}>
                    <PieSlice
                        percentage={grade * 10}
                        fill={color}
                        radius={28}
                    />
                </div>
                <div className={styles.pieGrade}>{grade}</div>
            </div>
        </div>
    );
}

type PieSliceProps = {
    percentage: number; // 0–100
    radius: number; // circle radius
    fill: string; // slice color
};
export function PieSlice({percentage, radius, fill}: PieSliceProps) {
    const normalizedPercent = Math.min(Math.max(percentage, 0), 100);
    const angle = (normalizedPercent / 100) * 360;

    const center = radius;
    const r = radius;

    // Convert angle to SVG arc coordinates
    const rad = (angle - 90) * (Math.PI / 180);
    const x = center + r * Math.cos(rad);
    const y = center + r * Math.sin(rad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = `
        M ${center} ${center}
        L ${center} ${center - r}
        A ${r} ${r} 0 ${largeArcFlag} 1 ${x} ${y}
        Z
    `;

    return (
        <svg width={radius * 2} height={radius * 2}>
            {/* Circle for 100% */}
            {percentage === 100 && (
                <circle cx={center} cy={center} r={r} fill={fill} />
            )}

            {/* Pie slice */}
            <path d={pathData} fill={fill} stroke="none" />
        </svg>
    );
}
