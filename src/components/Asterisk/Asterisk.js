import React from 'react'
import classNames from 'classnames';

import {Icon} from '../';

function Asterisk({btnClass}) {
  const btnClasses = classNames({
    [btnClass]: btnClass
  });

  return (
    <div className="asterisk">
        <a className={btnClasses ? btnClasses : null} href="/#">
          <Icon className="asterisk-off" name="star"></Icon>
          <Icon className="asterisk-on" name="star-fill"></Icon>
        </a>
    </div>
  )
}

export default Asterisk;
