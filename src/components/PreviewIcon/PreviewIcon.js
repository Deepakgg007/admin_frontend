import { useState } from "react";
import { Card } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";

import Icon from "../Icon/Icon";

function PreviewIconList({...props}) {
  return (
    <ul className="preview-icon-list">
        {props.children}
    </ul>
  )
}

function PreviewIcon({title, icon, ...props}) {
  const [copyText] = useState(`<Icon name="${icon}"></Icon>`);
  const [copyState, setCopyState] = useState(false);

  const onCopyClick = () => {
      setCopyState(true);
      setTimeout(() => setCopyState(false), 2000);
  };

  return (
    <li className="preview-icon-item">
        <Card className="h-100 preview-icon-box">
            <CopyToClipboard text={copyText} onCopy={onCopyClick}>
              <button type="button" className="btn btn-icon btn-clipboard js-copy text-light">
                  <Icon name={`${copyState ? 'copy-fill' : 'copy'}`}></Icon>
                  <span className="js-copy-tooltip">
                    {copyState ? "Copied" : "Copy"}
                  </span>
              </button>
            </CopyToClipboard>
            <div className="preview-icon-wrap">
                <Icon name={icon}></Icon>
            </div>
            <span className="preview-icon-name">{title}</span>
        </Card>
    </li>
  )
}

PreviewIcon.List = PreviewIconList;

export default PreviewIcon;