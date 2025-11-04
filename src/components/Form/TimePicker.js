import { useEffect, useRef, useState } from 'react'
import { Form } from 'react-bootstrap';

import {Dropdown} from 'bootstrap'

import toMin from '../../utilities/toMin';
import toTime from '../../utilities/toTime';
import toTwelve from '../../utilities/toTwelve';

function TimePicker({className,placeholder,value, ...props}) {
  const [pickerTime,setPickerTime] = useState(value)
  const {start = '00:00', end = '23:59', interval = 30, format=24} = props;

  let total = toMin(end) - toMin(start);
  let slot = Math.floor(total/interval);
  let timeSlots = [];
  let startTime = toMin(start);

  for(let i=0; i<slot+1; i++){
    let currentTime = startTime;
    if(format === 12){
      timeSlots.push(toTwelve(toTime(currentTime)))
    }else{
      timeSlots.push(toTime(currentTime))
    }
    startTime = currentTime + interval;
  }
  const timeInput = useRef(null);

  function timePickHandler(e){
    e.preventDefault();
    let target = e.target;
    let timeValue = target.dataset.pickerTime;
    let allItems = timeInput.current.nextElementSibling.querySelectorAll('.nk-timepicker-time');
    setPickerTime(timeValue);
    allItems.forEach(item =>{
      item.classList.remove('active');
    })
    target.classList.add('active');
  }

  useEffect( ()=> {
    let thisElm = timeInput.current;
    thisElm.value = pickerTime;
    new Dropdown(thisElm,{
      offset:[0,5]
    })
  })

  return (
    <div className="dropdown">
      <Form.Control className={className} defaultValue={value} ref={timeInput} placeholder={placeholder} data-bs-toggle="dropdown" {...props}/>
      <ul className="dropdown-menu nk-timepicker-dropdown" style={{maxHeight:'400px',overflow:'auto'}}>
        {timeSlots.map((item,index) => {
            return( 
              <li key={index}>
                <button className="dropdown-item nk-timepicker-time" onClick={timePickHandler} data-picker-time={item} type="button">
                  {item}
                </button>
              </li>
            )
          })
        }
      </ul>
    </div>
  )
}

export default TimePicker