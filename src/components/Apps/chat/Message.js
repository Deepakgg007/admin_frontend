import classNames from "classnames";
import { Button, Dropdown } from "react-bootstrap";

import { Icon, Image, Media, CustomDropdownMenu, CustomDropdownToggle,  } from "../..";


function Message({className, isYou, isMe, ...props}) {
    const compClass = classNames({
        'nk-message': true,
        'is-you': isYou,
        'is-me': isMe,
        [className]: className
    });

    return (
        <div className={compClass}>
            {props.avatar && 
                <div className="nk-message-avatar">
                    <Media size="sm" shape="circle" middle>
                        <Image src={props.avatar} alt="" />
                    </Media>
                </div>
            }
            <div className="nk-message-content">
                {props.children}
            </div>
        </div>
    )
}

export function MessageActions({...props}){
    return (
        <ul className="nk-message-actions">
            <li className="d-none d-sm-block">
                <Button size="sm" variant="zoom" className="btn-icon text-light">
                    <Icon name="reply-fill"></Icon>
                </Button>
            </li>
            <li>
                <Dropdown>
                    <Dropdown.Toggle size="sm" as={CustomDropdownToggle} className="btn btn-icon btn-zoom btn-sm text-light">
                        <Icon name="more-v"></Icon>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu-sm" as={CustomDropdownMenu} align="end">
                        <div className="dropdown-content py-1">
                            <ul className="link-list is-compact">
                                <li className="d-sm-none">
                                    <a href="#dropdown-item">
                                        <Icon name="reply-fill"></Icon>
                                        <span>Reply</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#dropdown-item">
                                        <Icon name="pen-alt-fill"></Icon>
                                        <span>Edit</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#dropdown-item">
                                        <Icon name="trash-fill"></Icon>
                                        <span>Delete</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </Dropdown.Menu>
                </Dropdown>
            </li>
        </ul>
    )
}

Message.Actions = MessageActions;

export default Message;
