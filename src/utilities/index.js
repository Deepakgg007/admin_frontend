
// colors
export let Colors = {
    blue: "#0080FF",
    indigo: "#5b5efb",
    purple: "#8927f9",
    pink: "#f24a8b",
    red: "#df3c4e",
    orange: "#f85f32",
    yellow: "#f2bc16",
    green: "#2dc58c",
    teal: "#2acc9c",
    cyan: "#478ffc",
    black: "#000",
    white: "#fff",
    gray: "#6B7280",
    grayDark: "#374151",
    gray100: "#f1f2f7",
    gray200: "#E5E7EB",
    gray300: "#D1D5DB",
    gray400: "#6B7280",
    gray500: "#6B7280",
    gray600: "#4B5563",
    gray700: "#374151",
    gray800: "#1F2937",
    gray900: "#111827",
    primary: "#5f38f9",
    secondary: "#374151",
    success: "#2dc58c",
    info: "#478ffc",
    warning: "#f2bc16",
    danger: "#df3c4e",
    lighter: "#f1f2f7",
    light: "#E5E7EB",
    dark: "#1F2937",
    darker: "#111827",

    bodyColor: "#787c9e",
    bodyBg: "#f8f8f9",
    borderColor: "#d2d4e4",
    borderColorTranslucent: "rgba(0, 0, 0, 0.175)",

    linkColor: "#5f38f9",
    linkHoverColor: "#4c2dc7",
    codeColor: "#f24a8b",
    highlightBg: "#fcf2d0",
};

// list of all months in english word
export let monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


let getToday = function(){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
};
export let today = getToday();


let getTesterday = function(){
    let today = new Date();
    let yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let y_dd = String(yesterday.getDate()).padStart(2, '0');
    let y_mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    let y_yyyy = yesterday.getFullYear();

    return  y_yyyy + '-' + y_mm + '-' + y_dd;
};
export let yesterday = getTesterday();

let getCurrentMonth = function(){
    let today = new Date();
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    return yyyy + '-' + mm;
};

export let currentMonth = getCurrentMonth();

// get first and last character from string
let getInitials = function (name) {
    var names = name.split(' '),
    initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
}

export let toInitials = getInitials;

export let Break = { mb: 420, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400, any: Infinity };