import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

export default function BodyBackgroundController() {
    const location = useLocation();

    useEffect(() => {
        // Map routes to background colors
        const routeBg: Record<string, string> = {
            '/': '#ffffff',
            '/blueprintmodule': '#04121C',
            '/blueprintpremiummodule': '#04121C',
            '/live': '#04121C',
        };

        const bg = routeBg[location.pathname.toLowerCase()] || '#ffffff';
        document.body.style.backgroundColor = bg;

        // Cleanup to avoid leftover styling when component unmounts
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, [location]);

    return null; // This component just manages side-effects
}
