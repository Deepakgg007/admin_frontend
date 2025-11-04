import classNames from 'classnames';

function Image({src, alt, staticImage, className, fluid, thumbnail}) {
  const compClass = classNames({
    [className]: className,
    [`img-fluid`]: fluid,
    [`img-thumbnail`]: thumbnail
  });

  return (
    <>
      {!staticImage && <img src={src} alt={alt || ''} className={compClass} />}
      {staticImage && <img src={process.env.PUBLIC_URL + src} alt={alt || ''} className={compClass} />}
    </>
  )
}

export default Image