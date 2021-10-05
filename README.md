# kos2ical
Exports schedule from KOS to an iCal file

## Usage
1. Go to the page with Your personal schedule in KOS.
2. Open devtools and paste the script into console and press enter.
3. A lot of scary letters should come back out (in the form of an ICalendar text format).
4. Save the output into a file with an .ics extension.
5. Add the calendar file into Your calendar through Your favorite client (windows mail app works, gmail does too. The rest should as well.)

## LIMITATIONS
* I've literally only tested this on one schedule. There might be bugs.
* KOS doesn't give me any information about the day of the class, so it has to be computed. Make sure all the classes are in the correct dates before adding them to Your schedule.
* This only works with weekly classes for now.
* Doesn't handle colliding classes for now.
