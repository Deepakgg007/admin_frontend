import { useState } from "react";
import { Card } from "react-bootstrap"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { CopyToClipboard } from "react-copy-to-clipboard";

import Icon from "../Icon/Icon";
import OverlineTitle from "../Text/Text";

function CodePreview({...props}) {
    const [copyText] = useState(props.children);
    const [copyState, setCopyState] = useState(false);

    const onCopyClick = () => {
        setCopyState(true);
        setTimeout(() => setCopyState(false), 2000);
    };

    return (
        <Card.Body className="pt-0">
            <CopyToClipboard text={copyText} onCopy={onCopyClick}>
                <div className="d-flex align-items-center code-toolbar py-2">
                    <OverlineTitle>{props.title ? props.title : "Code Example"}</OverlineTitle>
                    <div className="js-copy-wrap ms-auto">
                        <button type="button" className="js-copy text-light">
                            <Icon name={`${copyState ? 'copy-fill' : 'copy'}`}></Icon>
                            <span className="js-copy-tooltip">
                                {copyState ? "Copied" : "Copy"}
                            </span>
                        </button>
                    </div>
                </div>
            </CopyToClipboard>
            <SyntaxHighlighter language="javascript" className="code-preview bg-lighter" style={a11yLight}>
                {props.children}
            </SyntaxHighlighter>
        </Card.Body>
    )
}

export default CodePreview