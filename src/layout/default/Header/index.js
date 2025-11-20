import { useState } from 'react';
import classNames from 'classnames';
import { Dropdown, Button, Offcanvas, Alert } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';

import { Logo, Image, Icon, MediaAction, MediaGroup, MediaText, Media, LinkList, LinkListItem, CustomDropdownToggle, CustomDropdownMenu, Schedule } from '../../../components';
import ToggleSidebar from '../Toggle/Sidebar'
import ToggleNavbar from '../Toggle/Navbar'

import { useLayout, useLayoutUpdate } from './../LayoutProvider'

// Navbar alignment styles
const navbarStyles = `
  .nk-header-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nk-header-tools {
    margin-left: auto;
  }
`;

function QuickNav({className,...props}) {
    const compClass = classNames({
        "nk-quick-nav": true,
        [className]: className,
    })
  return (
    <ul className={compClass}>{props.children}</ul>
  )
}

function QuickNavItem({className, ...props}) {
    const compClass = classNames({
        "d-inline-flex": true,
        [className]: className,
    })
  return (
    <li className={compClass}>{props.children}</li>
  )
}

function Header() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const layout = useLayout();
  const layoutUpdate = useLayoutUpdate();

  const compClass = classNames({
    "nk-header nk-header-fixed": true,
    [`is-${layout.headerVariant}`]: layout.headerVariant,
  });

  const navClass = classNames({
    "nk-header-menu nk-navbar": true,
    "navbar-active": layout.headerActive,
    // eslint-disable-next-line
    "navbar-mobile": layout.headerTransition || eval(`layout.breaks.${layout.headerCollapse}`) > window.innerWidth,
  });

  // offcanvas
  const handleOffcanvasClose = () => setShowOffcanvas(false);
  const handleOffcanvasShow = () => setShowOffcanvas(true);

  return (
    <>
        <style>{navbarStyles}</style>
        <div className={compClass}>
            <div className="container-fluid">
                <div className="nk-header-wrap">
                <div className="nk-header-logo">
                    <ToggleSidebar variant="zoom" icon='menu' />
                    <ToggleNavbar className="me-2" />
                    <Logo />
                </div>
                {layout.headerActive && <div className="navbar-overlay" onClick={layoutUpdate.headerMobile}></div>}

                <div className="nk-header-tools">
                    <QuickNav>

                        <Dropdown as={QuickNavItem}>
                            <Dropdown.Toggle bsPrefix as={CustomDropdownToggle}>
                                
                                <div className="d-none d-sm-flex">
                                    <Media shape="circle">
                                        <Image src='/images/haegl.png' staticImage thumbnail/>
                                    </Media>
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-md" as={CustomDropdownMenu}> 
                                <div className="dropdown-content dropdown-content-x-lg py-3 border-bottom border-light">
                                    <MediaGroup>
                                        <Media size="xl" shape="circle">
                                            <Image src='/images/haegl.png' staticImage thumbnail/>
                                        </Media>
                                        <MediaText>
                                            <div className="lead-text">Haegl Geteducate</div>
                                            <span className="sub-text">Admin</span>
                                        </MediaText>
                                    </MediaGroup>
                                </div>
                                <div className="dropdown-content dropdown-content-x-lg py-3">
                                    <LinkList>
                                        <LinkListItem to="/auths/auth-login"><Icon name="signout"></Icon><span>Log Out</span></LinkListItem>
                                    </LinkList>
                                </div>
                            </Dropdown.Menu>
                        </Dropdown>
                    </QuickNav>
                </div>
                </div>
            </div>
        </div>

       
    </>
  )
}

export default Header