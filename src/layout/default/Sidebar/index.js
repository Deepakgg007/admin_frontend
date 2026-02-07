import { useRef, useEffect } from 'react'
import classNames from 'classnames'
import SimpleBar from 'simplebar-react'
import { Logo } from '../../../components/'
import Menu from './Menu'
import ToggleCompact from '../Toggle/Compact'
import ToggleSidebar from '../Toggle/Sidebar'

import { useLayout, useLayoutUpdate } from './../LayoutProvider';

function Sidebar() {
  const layout = useLayout();
  const layoutUpdate = useLayoutUpdate();
  const simpleBarRef = useRef(null);

  const compClass= classNames({
    'nk-sidebar nk-sidebar-fixed':true,
    'is-compact': layout.sidebarCompact,
    'sidebar-active': layout.sidebarActive,
    [`is-${layout.sidebarVariant}`]: layout.sidebarVariant,
  });

  // Save and restore scroll position
  useEffect(() => {
    const simpleBarElement = simpleBarRef.current;
    if (!simpleBarElement) return;

    const scrollElement = simpleBarElement.getScrollElement();

    // Restore scroll position from sessionStorage on mount
    const savedScrollPosition = sessionStorage.getItem('sidebarScrollPosition');
    if (savedScrollPosition) {
      scrollElement.scrollTop = parseInt(savedScrollPosition, 10);
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      sessionStorage.setItem('sidebarScrollPosition', scrollElement.scrollTop);
    };

    scrollElement.addEventListener('scroll', handleScroll);

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {layout.sidebarActive && <div className="sidebar-overlay" onClick={layoutUpdate.sidebarMobile}></div>}
      <div className={compClass}>
          <div className="nk-sidebar-element nk-sidebar-head">
              <div className="nk-sidebar-brand">
                  <Logo />
                  <ToggleCompact />
                  <ToggleSidebar />
              </div>
          </div>
          <div className="nk-sidebar-element nk-sidebar-body">
              <div className="nk-sidebar-content">
                <SimpleBar ref={simpleBarRef} className="nk-sidebar-menu">
                  <Menu/>
                </SimpleBar>
              </div>
          </div>
      </div>
    </>
  )
}

export default Sidebar