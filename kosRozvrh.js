function generate(semesterEnd){
//Call function after script loads
function whenAvailable(name, callback) {
    var interval = 10; // ms
    window.setTimeout(function() {
        if (window[name]) {
            callback(window[name]);
        } else {
            whenAvailable(name, callback);
        }
    }, interval);
}

function dateTimeToUntilString(time, utc) {
        if (utc === void 0) { utc = true; }
        var date = new Date(time);
        return [
            date.getUTCFullYear().toString().padStart(4, '0'),
            (date.getUTCMonth() + 1).toString().padStart( 2, '0'),
            date.getUTCDate().toString().padStart(2, '0'),
            'T',
            date.getUTCHours().toString().padStart( 2, '0'),
            date.getUTCMinutes().toString().padStart( 2, '0'),
            date.getUTCSeconds().toString().padStart( 2, '0'),
            utc ? 'Z' : ''
        ].join('');
    };

function dayFromPosition(listek) {
    let n = listek.offsetTop / 120;
    if (n === 0) {
        return "MO";
    } else if (n === 1) {
        return "TU";
    } else if (n === 2) {
        return "WE";
    } else if (n === 3) {
        return "TH";
    } else if (n === 4) {
        return "FR";
    }
}

//Generate the actual ICal file
function generateICal() {
    var comp = new ICAL.Component(['vcalendar', [],
        []
    ]);
    comp.updatePropertyWithValue('prodid', '-//AMU KOS Schedule generator');

    //Divs containing info about the classes
    let classes = $("#tabRozvrh [id^=detaillistek");
    let locations = $("#tabRozvrh [id^=listek");

    //Go through all of them and separate free text from text in tags
    for (let i = 0; i < classes.length; i++) {
        let separators = $(classes.get(i)).children().contents().filter(function() {
            return this.nodeType == 1;
        });
        let info = [];
        let nadpisy = $(classes.get(i)).children().contents().filter(function() {
            return this.nodeType == 3;
        }).map(function(i, val) {
            return val.nodeValue.replace(/[:\-,\(\)]|[0-9]/g, "").trim(); //Remove special chars
        });
        texty = [];
        for (let j = 0; j < nadpisy.length; j++) {
            if (nadpisy[j]) {
                texty.push({
                    title: nadpisy[j],
                    value: ""
                });
            }
        }
        //Join the appropriate strings and add them to their respective keys
        let k = 0;
        for (let j = 0; j < separators.length && k < texty.length; j++) {
            if (separators[j].tagName == "BR") {
                k++;
            } else {
                if (texty[k].value == "") {
                    texty[k].value = separators[j].innerHTML;
                } else {
                    texty[k].value += ", " + separators[j].innerHTML;
                }
            }
        }

        let vevent = new ICAL.Component('vevent'),
            ev = new ICAL.Event(vevent);

		// Split time string into start and end time, and into hours and minutes.
        let times = texty[7].value.split("-");
        let startTime = times[0].split(":");
        let endTime = times[1].split(":");

        // Set event properties
        ev.summary = texty[1].value;
        ev.description = texty[4].value + ", " + texty[3].value
        ev.uid = texty[0].value;

        ev.startDate = ICAL.Time.now().startOfWeek(2);
        ev.startDate.day += locations[i].offsetTop / 120;
        ev.startDate.hour = parseInt(startTime[0]);
        ev.startDate.minute = parseInt(startTime[1]);
        ev.startDate.wrappedJSObject.isDate = false;
        //For some reason this conversion hack in necessary to include time in the output.
        ev.startDate = ICAL.Time.fromString(ev.startDate.toString());

        ev.endDate = ICAL.Time.now().startOfWeek(2);
        ev.endDate.day += locations[i].offsetTop / 120;
        ev.endDate.hour = parseInt(endTime[0]);
        ev.endDate.minute = parseInt(endTime[1]);
        ev.endDate.wrappedJSObject.isDate = false;
        //For some reason this conversion hack in necessary to include time in the output.
        ev.endDate = ICAL.Time.fromString(ev.endDate.toString());

		//Configure weekly
	vevent.addPropertyWithValue('RRULE', 'FREQ=WEEKLY;BYDAY=' + dayFromPosition(locations[i]) + ';INTERVAL=1;UNTIL='+dateTimeToUntilString(semesterEnd));

        // Add the new component
        comp.addSubcomponent(vevent);

    }
    console.log(comp.toString());
    //Cleanup
    $('script[src="https://unpkg.com/ical.js@1.4.0/build/ical.js"]').remove();
}

//Append ICal script to head
$("head").append('<script async defer type="text/javascript" src="https://unpkg.com/ical.js@1.4.0/build/ical.js"></script>');

//Parse the table after the script loads
whenAvailable("ICAL", function(t) {
    generateICal();
});
}