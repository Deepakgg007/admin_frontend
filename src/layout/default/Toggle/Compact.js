import classNames from 'classnames';
import Button from 'react-bootstrap/Button';

import { Icon } from '../../../components';
import {useLayout, useLayoutUpdate} from './../LayoutProvider';

function Compact({icon}) {
  const layout = useLayout();
  const layoutUpdate = useLayoutUpdate();

  const btnClass = classNames({
    'btn-icon text-light compact-toggle':true,
    'active': layout.sidebarCompact
  })
  
  return (
    <div className="nk-compact-toggle me-n1">
        <Button size="md" variant="no-hover" onClick={layoutUpdate.sidebarCompact} className={btnClass}>
          <Icon className="off" name={icon || 'chevrons-left'}/>
          <Icon className="on" name={icon || 'chevrons-right'}/>
        </Button>
    </div>
  )
}

export default Compact