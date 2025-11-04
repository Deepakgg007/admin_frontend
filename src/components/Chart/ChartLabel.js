import classNames from "classnames";

export function ChartLabelGroup({className, ...props}) {
  const Classes = classNames({
    'chart-label-group': true,
    [className]: className
  });

  return (
    <div className={Classes}>
      {props.children}
    </div>
  )
}

function ChartLabel({className, ...props}) {
  const Classes = classNames({
    'chart-label': true,
    [className]: className
  });

  return (
    <div className={Classes}>
      <div className="title">
        {props.children}
      </div>
    </div>
  )
}

// dot notation component
ChartLabel.Group = ChartLabelGroup;

export default ChartLabel;
