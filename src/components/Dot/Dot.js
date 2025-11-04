import classNames from "classnames"

function Dot({className, variant, ...props}) {
    const Classes = classNames({
        'dot': true,
        [`bg-${variant}`]: variant,
        [className]: className
    });

    return (
        <span className={Classes}></span>
    )
}

export default Dot;
