// Constants
const DAY_MS = 86400000;
const LINEBREAK = CardService.newGrid();
const CALENDARS = CalendarApp.getAllCalendars();
const ICONS = {
    watch: CardService.newIconImage().setIconUrl('https://img.icons8.com/ios/250/000000/time.png'),
    sheet: CardService.newIconImage().setIconUrl('https://img.icons8.com/ios/250/000000/notepad.png'),
    calendar: CardService.newIconImage().setIconUrl('https://img.icons8.com/ios/250/000000/calendar.png'),
    pen: CardService.newIconImage().setIconUrl('https://img.icons8.com/ios/250/000000/edit.png')
}

// Global variables
let log = '';
let startDate = new Date(Date.now() - DAY_MS * 7);
let endDate = new Date();

// Utility functions
const refreshHomepage = () => CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(createCardHomepage())).build();

const refreshEditConfig = () => CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().updateCard(createCardEditConfig())).build();

// Get & set functions
function getTimeStats() {
    let data = JSON.parse(PropertiesService.getUserProperties().getProperty('timeStats'));
    if (data === null) data = BASE_TIMESTATS;
    return data;
}
function setTimeStats(data) {
    PropertiesService.getUserProperties().setProperty('timeStats', JSON.stringify(data));
}
function getCalendar() {
    let data = JSON.parse(PropertiesService.getUserProperties().getProperty('calendar'));
    if (data === null) data = BASE_CALENDAR;
    return data;
}
function setCalendar(calendar) {
    PropertiesService.getUserProperties().setProperty('calendar', JSON.stringify(calendar));
}
function getOutput() {
    let data = JSON.parse(PropertiesService.getUserProperties().getProperty('output'));
    if (data === null) data = BASE_TOGGLE;
    return data;
}
function setOutput(outputToggle) {
    PropertiesService.getUserProperties().setProperty('output', JSON.stringify(outputToggle));
}

// Base stats
const BASE_TOGGLE = {
    header: true,
    label: true,
    hours: true,
    percent: true
}

const BASE_CALENDAR = {
    name: null,
    id: -1,
}

const BASE_TIMESTATS = [
    {
        name: '🍅 Tomato',
        label: 'red',
        color: CalendarApp.EventColor.RED,
    },
    {
        name: '🍊 Tangerine',
        label: 'orange',
        color: CalendarApp.EventColor.ORANGE,
    },
    {
        name: '🌿 Sage',
        label: 'light green',
        color: CalendarApp.EventColor.PALE_GREEN,
    },
    {
        name: '❄️ Peacock',
        label: 'cyan',
        color: CalendarApp.EventColor.CYAN,
    },
    {
        name: '🪻 Lavender',
        label: 'light blue',
        color: CalendarApp.EventColor.PALE_BLUE,
    },
    {
        name: '🪨 Graphite',
        label: 'graphite',
        color: CalendarApp.EventColor.GRAY,
    },
    {
        name: '🌸 Flamingo',
        label: 'pink',
        color: CalendarApp.EventColor.PALE_RED,
    },
    {
        name: '🍌 Banana',
        label: 'yellow',
        color: CalendarApp.EventColor.YELLOW,
    },
    {
        name: '🥦 Basil',
        label: 'dark green',
        color: CalendarApp.EventColor.GREEN,
    },
    {
        name: '🫐 Blueberry',
        label: 'dark blue',
        color: CalendarApp.EventColor.BLUE,
    },
    {
        name: '🍇 Grape',
        label: 'purple',
        color: CalendarApp.EventColor.MAUVE,
    },
    {
        name: '⏱️ Default',
        label: 'default',
        color: '',
    },
    {
        name: 'Unlabelled time',
        label: 'unlabelled',
        color: null,
    }
];