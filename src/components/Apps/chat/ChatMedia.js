import classNames from "classnames";

import {Image, Icon} from "../../../components";

function ChatMedia({className, ...props}) {
  const compClass = classNames({
    'nk-chat-media-list': true,
    [className]: className
  });

  return (
    <ul className={compClass}>
        {props.children}
    </ul>
  )
}

export function ChatMediaItem({className, src, icon, ...props}) {
  const compClass = classNames({
    'nk-chat-media-item': true,
    'is-video': icon,
    [className]: className
  });

  return (
    <li>
      <a href="#media-toggle" className={compClass}>
        <Image src={src} alt="" />
        {icon && <Icon name={icon}></Icon>}
      </a>
    </li>
  )
}

ChatMedia.Item = ChatMediaItem;

export default ChatMedia;
