import classNames from "classnames";

import Image from "../Image/Image";
import Media from "../Media/Media";
import OverlineTitle from "../Text/Text";
import Icon from "../Icon/Icon";

function Timeline({className, ...props}) {
    const Classes = classNames({
        'nk-timeline': true,
        [className]: className
    });

    return (
        <div className={Classes}>{props.children}</div>
    )
}

function TimelineGroup({className, title, ...props}) {
    const Classes = classNames({
        'nk-timeline-group': true,
        [className]: className
    });

    return (
        <div className={Classes}>
            <div className="nk-timeline-heading">
                <OverlineTitle tag="h6">{title}</OverlineTitle>
            </div>
            {props.children}
        </div>
    )
}

export function TimelineList({...props}) {
    return (
        <div className="nk-timeline-list">{props.children}</div>
    )
}

export function TimelineItem({symbol, avatar, variant, ...props}) {
    return (
        <div className="nk-timeline-item">
            <div className="nk-timeline-item-inner">
                <div className="nk-timeline-symbol">
                    {symbol ? 
                        <Media size="md" shape="circle" variant={variant}>
                            <Icon name={symbol}></Icon>
                        </Media> : 
                        <Media size="md" shape="circle">
                            <Image src={avatar} alt="avatar"/>
                        </Media>
                    }
                </div>
                <div className="nk-timeline-content">
                    {props.children}
                </div>
            </div>
        </div>
    )
}

// dot notation component
Timeline.Group = TimelineGroup;
Timeline.List = TimelineList;
Timeline.Item = TimelineItem;

export default Timeline;
