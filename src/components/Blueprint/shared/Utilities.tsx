import {blankLogo, teamLogos} from '../../../consts/images';

export function logoImage(
    team?: string,
    className?: string,
    defaultLogo?: string
) {
    return (
        <img
            src={teamLogos.get(team ?? '') ?? defaultLogo ?? blankLogo}
            className={className}
        />
    );
}
