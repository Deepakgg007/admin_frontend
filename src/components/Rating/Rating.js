import classNames from 'classnames';

export default function Rating({className, rating, ...props}) {
  const elemClass = classNames(
    'rating',
    className
  );
  
  let ratingValue = Math.floor(rating);
  let baseRatingValue = 5;

  return (
    <ul className={elemClass}>
      <RatingItem icon="star-fill" className="checked" count={ratingValue} />
      {(baseRatingValue - ratingValue > 0) && <RatingItem icon="star" count={baseRatingValue - ratingValue} />}
    </ul>
  );
};

function RatingItem({className,...props}) {
    const elemClass = classNames(
        'rating-label',
        className
    );

  let items = [];
  for (let i = 0; i < props.count; i++) {
    let key = (Math.random() + 1).toString(36).substring(7);
    items.push(<li key={key} className={elemClass}><em className={`icon ni ni-${props.icon}`}></em></li>);
  }
  return items;
}
