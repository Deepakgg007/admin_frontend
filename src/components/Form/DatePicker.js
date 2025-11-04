import {useLayoutEffect, useRef} from 'react'
import { Datepicker } from 'vanillajs-datepicker';
import { Form } from 'react-bootstrap';

function DatePicker({className, value, id, ...props}) {
    const {autoHide, clearBtn, format, maxView, pickLevel, startView, title, todayBtn, weekStart} = props;
    const dateInput = useRef(null);

    useLayoutEffect( ()=> {
      let opt = {
        title: title || '',
        buttonClass: 'btn btn-md',
        autohide: autoHide || true,
        clearBtn: clearBtn || false,
        todayBtn: todayBtn || false,
        format: format || 'yyyy-mm-dd',
        maxView: maxView || 3,
        pickLevel: pickLevel || 0,
        startView: startView || 0,
        weekStart: weekStart || 0
      };
      new Datepicker(dateInput.current, opt);

    })

  return (
    <>
      <Form.Control className={className} defaultValue={value} ref={dateInput} id={id} placeholder="yyyy-mm-dd" autoComplete="off"/> 
    </>
  )
}

export default DatePicker