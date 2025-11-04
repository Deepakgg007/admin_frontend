import { Dropdown } from 'react-bootstrap';
import { Asterisk, Icon, CustomDropdownMenu, CustomDropdownToggle, } from "../../";

function Reply({...props}) {
  return (
    <div className="nk-ibx-reply-item nk-reply-item">
        {props.children}
    </div>
  )
}

export function ReplyHeader({...props}) {
  return (
    <div className="nk-reply-header nk-ibx-reply-header toggle-reply">
        {props.children}
        <ReplyTools />
    </div>
  )
}

export function ReplyTools() {
    return (
        <ul className="nk-reply-tools g-1">
            <li className="attach-msg d-none d-sm-inline-block"><Icon name="clip-h"></Icon></li>
            <li className="date-msg d-none d-sm-inline-block"><span className="date">14 Jan, 2020</span></li>
            <li className="replyto-msg">
                <a href="/#" className="btn btn-zoom btn-icon btn-md" title="Reply">
                    <Icon name="curve-up-left"></Icon>
                </a>
            </li>
            <li className="more-actions">
                <Dropdown>
                    <Dropdown.Toggle as={CustomDropdownToggle} className="btn btn-zoom btn-icon btn-md">
                        <Icon name="more-v"></Icon>
                    </Dropdown.Toggle>
                    <Dropdown.Menu as={CustomDropdownMenu} align="end">
                        <div className="dropdown-content py-1">
                            <ul className="link-list">
                                <li><a href="/#"><Icon name="reply-fill"></Icon><span>Reply to</span></a></li>
                                <li><a href="/#"><Icon name="forward-arrow-fill"></Icon><span>Forward</span></a></li>
                                <li><a href="/#"><Icon name="trash-fill"></Icon><span>Delete this</span></a></li>
                                <li><a href="/#"><Icon name="report-fill"></Icon><span>Report Spam</span></a></li>
                            </ul>
                        </div>
                    </Dropdown.Menu>
                </Dropdown>
            </li>
        </ul>
    )
}

export function ReplyBody({...props}) {
    return (
        <div className="nk-reply-body nk-ibx-reply-body">
            <div className="nk-reply-entry entry wide-md">
                {props.children}
            </div>
        </div>
    )
}

export function ReplyHead() {
    return (
        <div className="nk-ibx-reply-head">
            <div className="d-flex gap g-2">
                <div className="d-flex align-items-center">
                    <h4 className="title">Build prototypes without code</h4>
                </div>
                <ul className="nk-ibx-tags">
                    <li><span className="badge text-bg-primary-soft">Important</span></li>
                </ul>
            </div>
            <ul className="d-flex g-1 me-n1">
                <li className="d-none d-sm-block">
                    <a href="/#" className="btn btn-icon btn-zoom btn-md" title="Print">
                        <Icon name="printer"></Icon>
                    </a>
                </li>
                <li>
                    <Asterisk btnClass="btn btn-zoom btn-icon btn-md"/>
                </li>
            </ul>
        </div>
    )
}


Reply.Header = ReplyHeader;
Reply.Body = ReplyBody;
Reply.Head = ReplyHead;

export default Reply