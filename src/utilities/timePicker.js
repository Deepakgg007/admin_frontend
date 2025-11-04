import randomId from './randomId'
import toMin from './toMin'
import toTwelve from './toTwelve'
import toTime from './toTime'
import attr from './attr'

// time piker
export default function timePicker(selector, opt) {
    let options = {
        format: opt.format ? opt.format : 24,
        interval : opt.interval ? opt.interval : 30,
        start : opt.start ? opt.start : '00:00',
        end : opt.end ? opt.end : '23:59',
        class: {
            dropdown: 'nk-timepicker-dropdown',
            dropdownItem: 'nk-timepicker-time',
        }
    };

    let timeInterval = options.interval;
    let timeFormat = options.format;
    let timeStart = options.start;
    let timeEnd = options.end;
    let totalTime = toMin(timeEnd) - toMin(timeStart);
    let timeSlot = Math.floor(totalTime / timeInterval);
    let items = []

    let startTime = toMin(timeStart);
    
    for (let i = 0; i < timeSlot+1; i++) {
        let currentTime = startTime;
        let timeString = function(){
            if(timeFormat == 12){
                return toTwelve(toTime(currentTime));
            }else{
                return toTime(currentTime)
            }
        };
        items.push(`<li><button class="dropdown-item ${options.class.dropdownItem}" data-picker-text="${timeString()}" type="button">
            ${timeString()}
        </button></li>`
        )
        startTime = currentTime + timeInterval;
    }

    let itemsMarkups = items.join('');
    attr(selector,'data-bs-toggle','dropdown');
    attr(selector,'data-bs-offset','0,5');

    let id = selector.id ? selector.id : randomId(8);
    
    if(!selector.id){
        attr(selector,'id',id);
    }

    let dropdownTemplate = `
    <ul class="dropdown-menu ${options.class.dropdown}" data-picker-id="${id}" style="max-height:400px;overflow:auto">
        ${itemsMarkups}
    </ul>
    `
    selector.insertAdjacentHTML('afterend', dropdownTemplate);

    let timeSelector = document.querySelectorAll(`.${options.class.dropdownItem}`);
    timeSelector.forEach(item => {
        item.addEventListener("click", function(e){
            e.preventDefault();
            let itemtext = item.dataset.pickerText;
            let input = item.closest(`.${options.class.dropdown}`).dataset.pickerId;
            document.getElementById(input).value = itemtext;
            //set active slot
            let allItems = item.closest(`.${options.class.dropdown}`).querySelectorAll(`.${options.class.dropdownItem}`);
            allItems.forEach(otherItem=>{
                otherItem.classList.remove('active');
            })
            item.classList.add('active');
        });
    })
}