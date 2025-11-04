import { useState } from 'react';
import {Alert} from 'react-bootstrap';

function AlertDismissible({variant, ...props}) {
    const [show, setShow] = useState(true);
    if (show) {
        return (
          <Alert variant={variant} onClose={() => setShow(false)} dismissible>
            {props.children}
          </Alert>
        );
    }
}

export default AlertDismissible