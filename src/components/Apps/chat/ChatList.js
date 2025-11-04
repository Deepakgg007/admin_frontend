import classNames from "classnames";

function ChatList({...props}) {
  return (
    <ul className="nk-chat-list">
        {props.children}
    </ul>
  )
}

export function ChatListItem({onClick, className, ...props}) {
  const compClass = classNames({
    'toggle-chat-item': true,
    [className]: className
  });

  return (
    <li className={compClass} onClick={onClick}>{props.children}</li>
  )
}

ChatList.Item = ChatListItem;

export default ChatList;
