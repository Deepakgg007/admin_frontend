import classNames from "classnames"
import Dot from "../Dot/Dot";

export function ChartLegendGroup({className, ...props}) {
    const Classes = classNames({
        'chart-legend-group': true,
        [className]: className
    });
    
    return (
        <div className={Classes}>{props.children}</div>
    )
}

function ChartLegend({className, symbol, ...props}) {
    const Classes = classNames({
        'chart-legend': true,
        [className]: className
    });

    return (
        <div className={Classes}>
            <Dot variant={symbol}/>
            <div className="chart-legend-text">
                <div className="title">{props.children}</div>
            </div>
        </div>
    )
}

ChartLegend.Group = ChartLegendGroup;

export default ChartLegend;
