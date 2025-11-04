import { useEffect, useRef } from 'react'
import noUiSlider from 'nouislider';

function NoUiSlider({start, connect, min, max, minDistance, maxDistance, step, orientation, tooltip, ...props}) {
    const noUiSliderElem =  useRef(null);

    let startValue = start
        startValue = /\s/g.test(startValue) ? startValue.split(' ') : startValue;
        startValue = startValue ? startValue : 0;

    let connectValue = connect;
        connectValue = /\s/g.test(connectValue) ? connectValue.split(' ') : connectValue;
        connectValue = typeof connectValue === 'undefined' ? 'lower' : connectValue;
        connectValue = connectValue === 'true' || connectValue === 'false' ? JSON.parse(connectValue) : connectValue;

    useEffect(() => {
        if (noUiSliderElem.current) {
            noUiSlider.create(noUiSliderElem.current, {
                start: startValue,
                connect: connectValue,
                range: {
                    'min': min || 0,
                    'max': max || 100
                },
                margin: minDistance || null,
                limit: maxDistance || null,
                step: step || 1,
                orientation: orientation || 'horizontal',
                tooltips: tooltip || false
            });
            return () => {
              noUiSliderElem.current = null;
            }
        }
    })
  return (
    <div ref={noUiSliderElem}></div>
  )
}

export default NoUiSlider