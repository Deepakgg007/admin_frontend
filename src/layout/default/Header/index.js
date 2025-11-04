import { useState } from 'react';
import classNames from 'classnames';
import { Dropdown, Button, Offcanvas, Alert } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';

import { Logo, Image, Icon, MediaAction, MediaGroup, MediaText, Media, LinkList, LinkListItem, CustomDropdownToggle, CustomDropdownMenu, Schedule } from '../../../components';
import ToggleSidebar from '../Toggle/Sidebar'
import ToggleNavbar from '../Toggle/Navbar'

import { useLayout, useLayoutUpdate } from './../LayoutProvider'

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
                            <Dropdown.Toggle variant="zoom" size="sm" bsPrefix className="btn-icon d-sm-none">
                                <Icon name="search"></Icon>
                            </Dropdown.Toggle>
                            <Dropdown.Toggle variant="zoom" size="md" bsPrefix className="btn-icon d-none d-sm-inline-flex">
                                <Icon name="search"></Icon>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-lg"> 
                                <div className="dropdown-content dropdown-content-x-lg py-1">
                                    <div className="search-inline">
                                        <div className="form-control-wrap flex-grow-1">
                                            <input placeholder="Type Query" type="text" className="form-control-plaintext" />
                                        </div>
                                        <Icon name="search" size="sm"></Icon>
                                    </div>
                                </div>
                                <Dropdown.Divider className="m-0"></Dropdown.Divider>
                                <div className="dropdown-content dropdown-content-x-lg py-3">
                                    <div className="dropdown-title pb-2">
                                        <h5 className="title">Recent searches</h5>
                                    </div>
                                    <ul className="dropdown-list gap gy-2">
                                        <li>
                                            <MediaGroup>
                                                <Media size="md" shape="circle" variant="light"><Icon name="clock"></Icon></Media>
                                                <MediaText>
                                                    <div className="lead-text">Styled Doughnut Chart</div>
                                                    <span className="sub-text">1 days ago</span>
                                                </MediaText>
                                                <MediaAction end>
                                                    <Button size="md" variant="zoom" className="btn-icon me-n1"><Icon name="trash"></Icon></Button>
                                                </MediaAction>
                                            </MediaGroup>
                                        </li>
                                        <li>
                                            <MediaGroup>
                                                <Media size="md" shape="circle" variant="light"><Icon name="clock"></Icon></Media>
                                                <MediaText>
                                                    <div className="lead-text">Custom Select Input</div>
                                                    <span className="sub-text">07 Aug</span>
                                                </MediaText>
                                                <MediaAction end>
                                                    <Button size="md" variant="zoom" className="btn-icon me-n1"><Icon name="trash"></Icon></Button>
                                                </MediaAction>
                                            </MediaGroup>
                                        </li>
                                        
                                    </ul>
                                </div>
                            </Dropdown.Menu>
                        </Dropdown>
                        <QuickNavItem>
                            <button className="btn-icon btn btn-zoom btn-sm d-sm-none" onClick={handleOffcanvasShow}>
                                <Icon name="bell"></Icon>
                            </button>
                            <button className="btn-icon btn btn-zoom btn-md d-none d-sm-inline-flex" onClick={handleOffcanvasShow}>
                                <Icon name="bell"></Icon>
                            </button>
                        </QuickNavItem>
                        <Dropdown as={QuickNavItem}>
                            <Dropdown.Toggle bsPrefix as={CustomDropdownToggle}>
                                
                                <div className="d-inline-flex d-sm-none">
                                    <Media shape="circle" size="md">
                                        <Image src='/images/avatar/c.jpg' staticImage thumbnail/>
                                    </Media>
                                </div>
                                <div className="d-none d-sm-flex">
                                    <Media shape="circle">
                                        <Image src='/images/avatar/c.jpg' staticImage thumbnail/>
                                    </Media>
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-md" as={CustomDropdownMenu}> 
                                <div className="dropdown-content dropdown-content-x-lg py-3 border-bottom border-light">
                                    <MediaGroup>
                                        <Media size="xl" shape="circle">
                                            <Image src='/images/avatar/c.jpg' staticImage thumbnail/>
                                        </Media>
                                        <MediaText>
                                            <div className="lead-text">Wesley Burland</div>
                                            <span className="sub-text">Owner &amp; Founder</span>
                                        </MediaText>
                                    </MediaGroup>
                                </div>
                                <div className="dropdown-content dropdown-content-x-lg py-3 border-bottom border-light">
                                    <LinkList>
                                        <LinkListItem to="/admin/profile"><Icon name="user"></Icon><span>My Profile</span></LinkListItem>
                                        <LinkListItem to="/admin/profile"><Icon name="contact"></Icon><span>My Contacts</span></LinkListItem>
                                    </LinkList>
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

        <Offcanvas className="offcanvas-size-lg" placement="end" show={showOffcanvas} onHide={handleOffcanvasClose}>
            <Offcanvas.Header closeButton className="border-bottom border-light">
                <Offcanvas.Title>Recent Notification</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <SimpleBar>
                    <Schedule>
                        <Schedule.Item symbol="active">
                            <span className="smaller">2:12 PM</span>
                            <div className="h6">Added 3 New Images</div>
                            <ul className="d-flex flex-wrap gap g-2 pt-2">
                                <li>
                                    <Media size="xxl">
                                        <Image src="/images/product/a.jpg" alt="gallery" thumbnail />
                                    </Media>
                                </li>
                                <li>
                                    <Media size="xxl">
                                        <Image src="/images/product/b.jpg" alt="gallery" thumbnail />
                                    </Media>
                                </li>
                                <li>
                                    <Media size="xxl">
                                        <Image src="/images/product/c.jpg" alt="gallery" thumbnail />
                                    </Media>
                                </li>
                            </ul>
                        </Schedule.Item>
                        <Schedule.Item symbol="active">
                            <span className="smaller">4:23 PM</span>
                            <div className="h6">Invitation for creative designs pattern</div>
                        </Schedule.Item>
                        <Schedule.Item symbol="active" contentClass="nk-schedule-content-no-border">
                            <span className="smaller">10:30 PM</span>
                            <div className="h6">Task report - uploaded weekly reports</div>
                            <div className="list-group-dotted mt-3">
                                <div className="list-group-wrap">
                                    <div className="p-3">
                                        <MediaGroup>
                                            <Media className="rounded-0">
                                                <Image src="/images/icon/file-type-pdf.svg" alt="icon" />
                                            </Media>
                                            <MediaText className="ms-1">
                                                <a href="#download" className="title">Modern Designs Pattern</a>
                                                <span className="text smaller">1.6.mb</span>
                                            </MediaText>
                                        </MediaGroup>
                                    </div>
                                    <div className="p-3">
                                        <MediaGroup>
                                            <Media className="rounded-0">
                                                <Image src="/images/icon/file-type-doc.svg" alt="icon" />
                                            </Media>
                                            <MediaText className="ms-1">
                                                <a href="#download" className="title">Cpanel Upload Guidelines</a>
                                                <span className="text smaller">18kb</span>
                                            </MediaText>
                                        </MediaGroup>
                                    </div>
                                    <div className="p-3">
                                        <MediaGroup>
                                            <Media className="rounded-0">
                                                <Image src="/images/icon/file-type-code.svg" alt="icon" />
                                            </Media>
                                            <MediaText className="ms-1">
                                                <a href="#download" className="title">Weekly Finance Reports</a>
                                                <span className="text smaller">10mb</span>
                                            </MediaText>
                                        </MediaGroup>
                                    </div>
                                </div>
                            </div>
                        </Schedule.Item>
                        <Schedule.Item symbol="active">
                            <span className="smaller">3:23 PM</span>
                            <div className="h6">Assigned you to new database design project</div>
                        </Schedule.Item>
                        <Schedule.Item symbol="active" contentClass="nk-schedule-content-no-border flex-grow-1">
                            <span className="smaller">5:05 PM</span>
                            <div className="h6">You have received a new order</div>
                            <Alert variant="info" className="mt-2">
                                <div className="d-flex">
                                    <Icon size="lg" name="file-code" className="opacity-75"></Icon>
                                    <div className="ms-2 d-flex flex-wrap flex-grow-1 justify-content-between">
                                        <div>
                                            <h6 className="alert-heading mb-0">Business Template - UI/UX design</h6>
                                            <span className="smaller">Shared information with your team to understand and contribute to your project.</span>
                                        </div>
                                        <div className="d-block mt-1">
                                            <Button size="md" variant="info">
                                                <Icon name="download"></Icon>
                                                <span>Download</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Alert>
                        </Schedule.Item>
                        <Schedule.Item symbol="active">
                            <span className="smaller">2:45 PM</span>
                            <div className="h6">Project status updated successfully</div>
                        </Schedule.Item>
                    </Schedule>
                </SimpleBar>
            </Offcanvas.Body>
        </Offcanvas>
    </>
  )
}

export default Header