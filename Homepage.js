// Creating widgets
function createWidgetToggle(label, description, fieldName, selected) {

  const toggleSwitch = CardService.newSwitch()
    .setFieldName(fieldName)
    .setSelected(selected)
    .setValue('active')
  
  const toggle = CardService.newDecoratedText()
    .setText(label)
    .setBottomLabel(description)
    .setSwitchControl(toggleSwitch);

  return toggle;
}

// Creating sections
function createSectionSource() {
  const startDatePicker = CardService.newDatePicker()
    .setTitle('Start')
    .setFieldName('startDate')
    .setValueInMsSinceEpoch(startDate.getTime())
  const endDatePicker = CardService.newDatePicker()
    .setTitle('End')
    .setFieldName('endDate')
    .setValueInMsSinceEpoch(endDate.getTime())

  const calendar = getCalendar();
  const inputCalName = CardService.newSelectionInput()
  .setType(CardService.SelectionInputType.DROPDOWN)
  .setFieldName('calName')
  .setTitle('Calendar name')

  for (let i = 0; i < CALENDARS.length; i++) {
    let selected = CALENDARS[i].getId() === calendar.id;
    inputCalName.addItem(CALENDARS[i].getName(), i, selected);
  }

  return CardService.newCardSection()
    .setHeader('Source')
    .addWidget(LINEBREAK)
    .addWidget(startDatePicker)
    .addWidget(endDatePicker)
    .addWidget(inputCalName)
}
function createSectionOutput() {

  const toggle = getOutput();
  const headerToggle = createWidgetToggle('Header', 'Row', 'headerRow', toggle.header);
  const labelToggle = createWidgetToggle('Labels', 'Column', 'labelsCol', toggle.label);
  const hoursToggle = createWidgetToggle('Hours', 'Column', 'hoursCol', toggle.hours);
  const percentToggle = createWidgetToggle('Percent', 'Column', 'percentCol', toggle.percent);

  const submitAction = CardService.newAction().setFunctionName('onSubmit');
  const editConfigAction = CardService.newAction().setFunctionName('onEditConfig');

  const editConfigButton = CardService.newTextButton()
  .setText('Edit labels')
  .setOnClickAction(editConfigAction);
  const submitButton = CardService.newTextButton()
  .setText('Add to sheet')
  .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
  .setOnClickAction(submitAction);

    const buttonSet = CardService.newButtonSet()
    .addButton(submitButton)
    .addButton(editConfigButton)

  return CardService.newCardSection()
    .setHeader('Output')
    .addWidget(headerToggle)
    .addWidget(labelToggle)
    .addWidget(hoursToggle)
    .addWidget(percentToggle)
    .addWidget(LINEBREAK)
    .addWidget(buttonSet);
}

// Event handlers
function onEditConfig(e) {
  const navEdit = CardService.newNavigation()
    .pushCard(createCardEditConfig());
  return CardService.newActionResponseBuilder()
    .setNavigation(navEdit)
    .build();
}
function onSubmit(e) {

  // Input handling
  const timeStats = getTimeStats();
  const inputs = e.commonEventObject.formInputs;

  const startMS = inputs.startDate.dateInput.msSinceEpoch;
  startDate.setTime(parseInt(startMS));
  const endMS = inputs.endDate.dateInput.msSinceEpoch;
  endDate.setTime(parseInt(endMS));

  if (inputs.calName === undefined) {
    log = `⚠️ error: please select a calendar`;
    return refreshHomepage();
  }

  const calendar = getCalendar();
  const calIndex = parseInt(inputs.calName.stringInputs.value);
  calendar.name = CALENDARS[calIndex].getName();
  calendar.id = CALENDARS[calIndex].getId();
  setCalendar(calendar);

  if (endMS - startMS < 0) {
    log = `⚠️ error: starting date must be less than the ending date`;
    return refreshHomepage();
  }

  const toggle = getOutput();
  toggle.header = inputs['headerRow'] !== undefined;
  toggle.label = inputs['labelsCol'] !== undefined;
  toggle.hours = inputs['hoursCol'] !== undefined;
  toggle.percent = inputs['percentCol'] !== undefined;
  setOutput(toggle);

  if (!toggle.label && !toggle.hours && !toggle.percent) {
    log = `⚠️ warning: all outputs are turned off`;
    return refreshHomepage();
  }

  // Calculating results
  const startInput = new Date(startDate.getTime());
  startInput.setHours(0,0,0,0);
  const endInput = new Date(endDate.getTime());
  endInput.setDate(endInput.getDate() + 1);
  endInput.setHours(0,0,0,0);

  const events = CalendarApp.getCalendarById(calendar.id).getEvents(startInput, endInput);
  let totalMinutes = 0;

  for (let activity of timeStats) {
    if (activity.label === '') {continue;} // skip unlabelled categories

    activity.minutes = 0;
    events.forEach( event => {
      if (event.getColor() === activity.color) {

        const start = Math.max(event.getStartTime().getTime(), startInput.getTime());
        const end = Math.min(event.getEndTime().getTime(), endInput.getTime());
        activity.minutes += (end - start)/1000/60;
      }
    });
    totalMinutes += activity.minutes;
  }

  // Calculating unlabelled time
  if (timeStats[12].label !== '') {
    let minutesInPeriod = (endInput.getTime() - startInput.getTime())/1000/60;
    timeStats[12].minutes = minutesInPeriod - totalMinutes;
    totalMinutes += timeStats[12].minutes;
  }

  // Calculating other stats
  timeStats.forEach( activity => {
    activity.hours = activity.minutes/60;
    activity.percentage = Math.round(activity.minutes / totalMinutes * 10000) / 100;
  })

  log = JSON.stringify(timeStats[10]);

  // Print the results into the sheet
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet === null) {
    log = `⚠️ error: please select a spreadsheet to write the data`;
    return refreshHomepage();
  }

  const firstCell = sheet.getCurrentCell();
  if (firstCell === null) {
    log = `⚠️ error: please select a spreadsheet cell to write the data`;
    return refreshHomepage();
  }

  let printer = [];
  let numRows;
  let numColumns;

  // Print out header
  if (toggle.header) {
    let headerRow = [];
    if (toggle.label) headerRow.push('Labels');
    if (toggle.hours) headerRow.push('Hours');
    if (toggle.percent) headerRow.push('Percentage');
    printer.push(headerRow)
  }
  
  // Print out the label, hours, and percentage stats
  for (let activity of timeStats) {
    if (activity.label === '') continue;
    let currRow = [];
    if (toggle.label) currRow.push(activity.label);
    if (toggle.hours) currRow.push(activity.hours);
    if (toggle.percent) currRow.push(activity.percentage); 
    numRows = currRow.length;
    printer.push(currRow);
  }
  numColumns = printer.length;
  const lastCellLetter = String.fromCharCode(firstCell.getA1Notation().charCodeAt(0) + numRows - 1);
  const lastCellNumber = parseInt(firstCell.getRow()) + numColumns - 1;
  const lastCell = `${lastCellLetter}${lastCellNumber}`;
  let activeRange = `${firstCell.getA1Notation()}:${lastCell}`

  const range = sheet.getRange(`${activeRange}`);
  range.setValues(printer);
  log = '';
  return refreshHomepage();
}

// Creating the card
function createCardHomepage() {
  const logger = CardService.newCardSection().addWidget(CardService.newTextParagraph().setText(log));
  const card = CardService.newCardBuilder().setName('Homepage');
  if (log != '') { card.addSection(logger); }
  return card
    .addSection(createSectionSource())
    .addSection(createSectionOutput())
    .build();
}