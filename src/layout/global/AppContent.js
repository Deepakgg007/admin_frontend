import React from 'react'
import classNames from "classnames"

function ContentInner({...props}) {
  return (
    <div className="nk-content-inner">
        <div className="nk-content-body">
            {props.children}
        </div>
    </div>
  )
}

function AppContent({content, className, ...props}) {
    const compClass = classNames({
        "nk-content": true,
        "nk-content-full": content === 'full-screen',
        "nk-content-stretch": content === 'stretch',
        [`${className}`]: className,
    });
  return (
    <div className={compClass}>
        {content === 'full-screen' && <ContentInner>{props.children}</ContentInner>}
        {content === 'stretch' ? <ContentInner>{props.children}</ContentInner> : 
          content !== 'full-screen' && <div className={content || 'container-fluid'}>
            <ContentInner>{props.children}</ContentInner>
          </div>
        }
    </div>
  )
}

export default AppContent