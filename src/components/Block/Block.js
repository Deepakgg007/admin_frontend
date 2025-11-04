import classNames from 'classnames'

function Block({className, ...props}) {
    const compClass = classNames({
        'nk-block': true,
        [className]: className
    });
  return (
    <div className={compClass}>{props.children}</div>
  )
}

function BlockTitle({className, ...props}) {
    const compClass = classNames({
        'nk-block-title': true,
        [className]: className
    });
  return (
    <>
        {props.tag && <props.tag className={compClass}>{props.children}</props.tag>}
        {!props.tag && <h1 className={compClass}>{props.children}</h1>}
    </>
  )
}

function BlockText({className, ...props}) {
  const compClass = classNames({
    [className]: className
  });

  return (
    <p className={compClass ? compClass : null}>{props.children}</p>
  )
}

function BlockHead({className, page, ...props}) {
    const compClass = classNames({
        'nk-block-head': true,
        'nk-page-head': page,
        [className]: className
    });
    
  return (
    <div className={compClass}>{props.children}</div>
  )
}

function BlockHeadBetween({className, gap, ...props}) {
    const compClass = classNames({
        'nk-block-head-between flex-wrap': true,
        'gap gap-2': !gap,
        [`gap gap-${gap}`]: gap,
        [className]: className
    });
  return (
    <div className={compClass}>{props.children}</div>
  )
}

function BlockHeadContent({className,tools, ...props}) {
    const compClass = classNames({
        'nk-block-head-content': true,
        'nk-block-head-tools': tools,
        [className]: className
    });
  return (
    <div className={compClass}>{props.children}</div>
  )
}

export default Block
export {Block, BlockTitle, BlockText, BlockHead, BlockHeadBetween, BlockHeadContent}

Block.Head = BlockHead;
Block.HeadContent =  BlockHeadContent;
Block.HeadBetween =  BlockHeadBetween;
Block.Title =  BlockTitle;
Block.Text =  BlockText;
