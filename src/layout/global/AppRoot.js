import React from 'react'
import classNames from "classnames"

import {useLayout} from './../default/LayoutProvider'; 

function AppRoot({className, ...props}) {
  const layout = useLayout();
  const compClass = classNames({
    "nk-app-root": true,
    'sidebar-compact': layout.sidebarCompact,
    'sidebar-shown': layout.sidebarActive,
    'navbar-shown': layout.headerActive,
    [`${className}`]: className,
  });
  return (
    <div className={compClass} data-sidebar-collapse={layout.sidebarCollapse || 'lg'} data-navbar-collapse={layout.headerCollapse || 'lg'}>
        {props.children}
    </div>
  )
}

export default AppRoot