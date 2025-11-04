import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

import { MediaGroup, Media, MediaText, Image, Icon, CustomDropdownToggle, CustomDropdownMenu, LinkList, LinkListItem } from "../../components";
import { toInitials } from "../../utilities";

// user table column
export const userColumns = [
    {
        name: "Users",
        grow: 2,
        selector: (row) => row.name,
        cell: (row) => (
            <MediaGroup>
                <Media size="md" shape="circle" variant={row.theme && row.theme}>
                { row.avatar ? 
                    <Image src={row.avatar} staticImage/> :
                    <span className="smaller fw-medium">{toInitials(row.name)}</span>
                }
                </Media>
                <MediaText>
                    <Link to={`/user-manage/user-profile/${row.id}`} className="title">{row.name}</Link>
                    <span className="small text">{row.email}</span>
                </MediaText>
            </MediaGroup>
        ),
        sortable: true,
    },
    {
        name: "Positions",
        selector: (row) => row.role,
        cell: (row) => (
            <span>{row.role}</span>
        ),
        sortable: true,
        hide: "md",
    },
    {
        name: "Plans",
        selector: (row) => row.plan,
        cell: (row) => (
            <span>{row.plan}</span>
        ),
        sortable: true,
        hide: "lg",
    },
    {
        name: "Billings",
        selector: (row) => row.billing,
        cell: (row) => (
            <span>{row.billing}</span>
        ),
        sortable: true,
        hide: "lg",
    },
    {
        name: "joined date",
        selector: (row) => row.joining,
        cell: (row) => (
            <span>{row.joining}</span>
        ),
        sortable: true,
        hide: "lg",
    },
    {
        name: "status",
        selector: (row) => row.status,
        cell: (row) => (
            <span className={`badge text-bg-${
                row.status === "Active" ? "success-soft" 
                : row.status === "Pending" ? "warning-soft" 
                : row.status === "Inactive" ? "secondary-soft" 
                : "primary-soft"}`
            }>
            {row.status ? row.status : 'General'}
            </span>
        ),
        sortable: true,
    },
    {
        name: "action",
        cell: (row) => (
            <div className="text-end w-100">
                <Dropdown>
                    <Dropdown.Toggle size="sm" as={CustomDropdownToggle} className="btn btn-sm btn-icon btn-zoom me-n1">
                        <Icon name="more-v"></Icon>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu-sm" as={CustomDropdownMenu} align="end">
                        <div className="dropdown-content py-1">
                            <LinkList className="link-list-hover-bg-primary link-list-md">
                                <LinkListItem to={`/user-manage/user-edit/${row.id}`}>
                                    <Icon name="edit"></Icon><span>Edit</span>
                                </LinkListItem>
                                <LinkListItem to={`/user-manage/user-edit/${row.id}`}>
                                    <Icon name="trash"></Icon><span>Delete</span>
                                </LinkListItem>
                                <LinkListItem to={`/user-manage/user-profile/${row.id}`}>
                                    <Icon name="eye"></Icon><span>View Details</span>
                                </LinkListItem>
                            </LinkList>
                        </div>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        ),
        sortable: false,
        hide: "md",
    },
    
];

// users data
const users = [
    {
        id:'uid01',
        name: 'Florenza Desporte',
        email: 'florenza@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/a.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Owner & Founder',
        plan: 'Basic',
        billing: 'Auto Debit',
        joining: '2022/04/25',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid02',
        name: 'Anna Adame',
        email: 'anna@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/b.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Active',
        followers: '143',
        following: '34',
        address: 'New York, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid03',
        name: 'Sean Bean',
        email: 'sean@dellito.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/c.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Support',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/01/12',
        status: 'Inactive',
        followers: '345',
        following: '54',
        address: 'Los Angels, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid04',
        name: 'Dorian Thiessen',
        email: 'dorian@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/d.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Editor',
        plan: 'Team',
        billing: 'Manual - Cash',
        joining: '2022/01/23',
        status: 'Inactive',
        followers: '543',
        following: '661',
        address: 'Milan, Italy',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid05',
        name: 'Kamran Adil',
        email: 'kamran@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/e.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Maintainer',
        plan: 'Company',
        billing: 'Manual - Cash',
        joining: '2022/02/14',
        status: 'Pending',
        followers: '765',
        following: '124',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid06',
        name: 'Travus Bruntjen',
        email: 'travus@gmail.com',
        website: 'www.softnio.com',
        theme: 'danger-soft',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Admin',
        plan: 'Enterprise',
        billing: 'Manual - Cash',
        joining: '2022/01/25',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid07',
        name: 'Saunder Offner',
        email: 'saunder@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/f.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid08',
        name: 'Melody Macy',
        email: 'melody@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/g.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Analyst',
        plan: 'Basic',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid09',
        name: 'Vladamir Koschek',
        email: 'vladamir@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/h.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Analyst',
        plan: 'Basic',
        billing: 'Auto Debit',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid10',
        name: 'Stephen MacGilfoyle',
        email: 'stephen@gmail.com',
        website: 'www.softnio.com',
        theme: 'info-soft',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid11',
        name: 'Frank Thomas',
        email: 'frank@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/i.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid12',
        name: 'Atef Khaled',
        email: 'atef@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/j.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid13',
        name: 'Jane Montgomery',
        email: 'jane@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/k.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Inactive',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid14',
        name: 'Patrick Newman',
        email: 'anna@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/l.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Inactive',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid15',
        name: 'Fox Mccloud',
        email: 'fox@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/m.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid16',
        name: 'Asiya Wolff',
        email: 'asiya@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/n.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid17',
        name: 'Joshua Mcnair',
        email: 'joshua@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/o.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid18',
        name: 'Lana Steiner',
        email: 'anna@gmail.com',
        website: 'www.softnio.com',
        theme: 'danger-soft',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid19',
        name: 'Raymond Atkins',
        email: 'raymond@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/p.jpg',
        description: `<p>> I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid20',
        name: 'Sara Koivisto',
        email: 'sara@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/a.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid21',
        name: 'Annette Hunter',
        email: 'annette@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/b.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid22',
        name: 'Kianna Pham',
        email: 'kianna@gmail.com',
        website: 'www.softnio.com',
        theme: 'primary-soft',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid23',
        name: 'Amira Talley',
        email: 'amira@gmail.com',
        website: 'www.softnio.com',
        theme: 'secondary-soft',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid24',
        name: 'Lana Steiner',
        email: 'lana@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/c.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid25',
        name: 'Kamran Ahmed',
        email: 'kamran@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/d.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Pending',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid26',
        name: 'Kevin Martin',
        email: 'kevin@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/b.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid27',
        name: 'Alex Smith',
        email: 'alex@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/e.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
    {
        id:'uid28',
        name: 'Kiara Advani',
        email: 'Kiara@gmail.com',
        website: 'www.softnio.com',
        avatar: '/images/avatar/f.jpg',
        description: `<p>I code and design websites worldwide. Mauris varius tellus vitae tristique sagittis. Sed aliquet, est nec auctor aliquet, orci ex vestibulum ex, non pharetra lacus erat ac nulla.</p><p>Sed vulputate, ligula eget mollis auctor, lectus elit feugiat urna, eget euismod turpis lectus sed ex. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc ut velit finibus, scelerisque sapien vitae, pharetra est. Nunc accumsan ligula vehicula scelerisque vulputate. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, dolore?</p>`,
        role: 'Subscriber',
        plan: 'Enterprise',
        billing: 'Manual - Paypal',
        joining: '2022/03/23',
        status: 'Active',
        followers: '2574',
        following: '78',
        address: 'California, United States',
        company: 'Softnio',
        designation: 'Frontend Developer',
        skills: ['Photoshop','illustrator','HTML','CSS','Javascript','React','Vue','Angular','Python'],
        social: [
            {
                site: 'github-circle',
                variant: 'text-bg-dark',
                link: '/softnio'
            },
            {
                site: 'dribbble',
                variant: 'text-bg-danger',
                link: '/softnio'
            },
            {
                site: 'twitter',
                variant: 'text-bg-info',
                link: '/softnio'
            },
            {
                site: 'linkedin',
                variant: 'text-bg-pink',
                link: '/softnio'
            }
        ],
        activity:[
            {
                type: 'media',
                time: '2:12 PM',
                title: 'Added 3 New Images',
                images:[
                    {
                        src: '/images/product/a.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/b.jpg',
                        alt: 'product image'
                    },
                    {
                        src: '/images/product/c.jpg',
                        alt: 'product image'
                    }
                ]
            },
            {
                type: 'regular',
                time: '4:23 PM',
                title: 'Invitation for creative designs pattern',
            },
            {
                type: 'file',
                time: '10:30 PM',
                title: 'Task report - uploaded weekly reports',
                files:[
                    {
                        type: 'pdf',
                        title: 'Modern Designs Pattern',
                        size: '1.6 mb'
                    },
                    {
                        type: 'doc',
                        title: 'cPanel Upload Guidelines',
                        size: '18 kb'
                    },
                    {
                        type: 'code',
                        title: 'Weekly Finance Reports',
                        size: '10 mb'
                    },
                ]
            },
            {
                type: 'alert',
                time: '5:05 PM',
                title: 'You have received a new order',
                alerts:[
                    {
                        icon: 'file-code',
                        title: 'Business Template - UI/UX design',
                        description: 'Shared information with your team to understand and contribute to your project.',
                        buttons:[
                            {
                                variant:'primary',
                                icon: 'download',
                                text: 'Download'
                            }
                        ]
                    },
                ]
            }
        ]
    },
];

export default users;
