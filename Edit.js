// Creating widgets
function createWidgetLabel(color, label) {
    return CardService.newTextInput()
        .setFieldName(color)
        .setTitle(color)
        .setValue(label)
}
function createWidgetReset() {
    const resetAct = CardService.newAction()
        .setFunctionName('onReset')

    return CardService.newTextButton()
        .setText('Reset')
        .setOnClickAction(resetAct)
}
function createWidgetSave() {
    const saveAction = CardService.newAction()
        .setFunctionName('onSave')

    return CardService.newTextButton()
        .setText('Save')
        .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
        .setOnClickAction(saveAction)
}

// Creating sections
function createSectionLabels() {

    const timeStats = getTimeStats();
    const img = CardService.newImage()
        .setImageUrl('https://cdn.discordapp.com/attachments/1156035760277950525/1243859471176831007/image.png?ex=665301e7&is=6651b067&hm=9b32978bd703e272734a5d464a05820ac6b586122d91a3e4499727ff80a48b1d&');

    const description = CardService.newTextParagraph()
        .setText('If a label is left empty, it won\'t be added to the spreadsheet')
    const buttonSet = CardService.newButtonSet()
        .addButton(createWidgetSave())
        .addButton(createWidgetReset())


    let section = CardService.newCardSection()
        .setHeader('Labels')
        .addWidget(LINEBREAK)

    for (let i in timeStats) {
        const newColor = createWidgetLabel(timeStats[i].name, timeStats[i].label);
        section.addWidget(newColor);
    }

    return section
        .addWidget(LINEBREAK)
        .addWidget(buttonSet)
        .addWidget(LINEBREAK)
        .addWidget(img)
        .addWidget(description)
        .setCollapsible(true)
        .setNumUncollapsibleWidgets(17)
}
function getColorLabel(e, color) {
    try {
        return e.commonEventObject.formInputs[color].stringInputs.value[0];
    } catch {
        return null;
    }
}


// Event handlers
function onSave(e) {

    // Retrieve data from form 
    const timeStats = getTimeStats();
    for (let i in timeStats) {
        let label = getColorLabel(e, timeStats[i].name);
        timeStats[i].label = (label !== null) ? label : '';
    }

    // Check data can be worked with
    let numFilled = 0;
    for (let activity of timeStats) {
        if (activity.label !== '') numFilled++;
    }
    if (numFilled === 0) {
        log = '⚠️ error: please enter at least one non-empty label';
        return refreshEditConfig();
    }

    // Return successfully
    setTimeStats(timeStats);
    log = '';
    const notif = CardService.newNotification()
        .setText('Save successful!')
    return CardService.newActionResponseBuilder()
        .setNotification(notif)
        .build();
}
function onReset(e) {
    setTimeStats(BASE_TIMESTATS);
    return refreshEditConfig();
}

// Creating the card
function createCardEditConfig() {
    const logger = CardService.newCardSection().addWidget(CardService.newTextParagraph().setText(log));
    const card = CardService.newCardBuilder()
    if (log != '') { card.addSection(logger); }

    card
        .setName('Edit config')
        .addSection(createSectionLabels())
    return card.build();
}