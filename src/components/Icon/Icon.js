import React from 'react'
import classNames from "classnames";

function Icon({name, size, className, variant, ...props}) {
  const compClass = classNames({
    [`${className}`]: className,
    [`icon ni ni-${name}`]: true,
    [`icon-${size}`]: size,
    [`text-${variant}`]: variant,
  });
  
  return (
    <em className={compClass}></em>
  )
}

export default Icon