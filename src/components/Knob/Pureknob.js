import { useLayoutEffect, useRef } from 'react'

import pureknob from '../../assets/js/pureknob/pureknob.js';
import { Colors } from '../../utilities/index';

function Pureknob({data, className, ...props}) {
    let knobRef = useRef(null);

    useLayoutEffect(() => {
        if(knobRef.current) {
            let setData = data;
            let size = setData.size ? setData.size : 100;
            let angleStart = setData.angleStart ? setData.angleStart : 1;
            let angleEnd = setData.angleEnd ? setData.angleEnd : 1;
            let angleOffset = setData.angleOffset ? setData.angleOffset : false;
            let colorBg = setData.colorBg ? setData.colorBg : Colors.gray200;
            let colorFg = setData.colorFg ? setData.colorFg : Colors.primary;
            let trackWidth = setData.trackWidth ? setData.trackWidth : .2;
            let min = setData.min ? setData.min : 0;
            let max = setData.max ? setData.max : 100;
            let readonly = setData.readonly ? setData.readonly : true;
            let value = setData.value ? parseInt(setData.value) : 0;
            let hideValue = setData.hideValue ? 0 : 1;

            // Create knob element, by given value size.
            let knob = pureknob.createKnob(size, size);

            // Set properties.
            knob.setProperty('angleStart', -angleStart * Math.PI);
            knob.setProperty('angleEnd', angleEnd * Math.PI);
            knob.setProperty('angleOffset', angleOffset * Math.PI);
            knob.setProperty('colorFG', colorFg);
            knob.setProperty('colorBG', colorBg);
            knob.setProperty('trackWidth', trackWidth);
            knob.setProperty('valMin', min);
            knob.setProperty('valMax', max);
            knob.setProperty('readonly', readonly);
            knob.setProperty('textScale', hideValue);

            // Set initial value.
            knob.setValue(value);

            // Create element node.
            let node = knob.node();

            // Add it to the DOM.
            knobRef.current.appendChild(node);

            return () => {
              knobRef.current = null;
            }
        }
    })

  return (
    <div ref={knobRef} className={className}>{props.children}</div>
  )
}

export default Pureknob;