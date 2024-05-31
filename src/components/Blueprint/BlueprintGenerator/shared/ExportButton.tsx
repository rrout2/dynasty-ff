import {Button} from '@mui/material';
import {toPng} from 'html-to-image';

export default function ExportButton(props: {
    className: string;
    pngName: string;
}) {
    const {className, pngName} = props;
    return (
        <Button
            variant="outlined"
            onClick={() =>
                toPng(
                    document.getElementsByClassName(
                        className
                    )[0] as HTMLElement,
                    {backgroundColor: 'rgba(0, 0, 0, 0)'}
                ).then(dataUrl => {
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = pngName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
            }
            style={{
                margin: '8px',
                width: '120px',
            }}
        >
            Export As PNG
        </Button>
    );
}
