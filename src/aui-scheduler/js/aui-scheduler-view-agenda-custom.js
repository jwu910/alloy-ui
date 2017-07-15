/**
 * The Custom Scheduler Component to allow agenda view to display items from prior weeks.
 *
 * @module aui-scheduler
 * @submodule aui-scheduler-view-agenda-custom
 */

var Lang = A.Lang,
    isFunction = Lang.isFunction,
    isNumber  = Lang.isNumber,

    AArray = A.Array,
    DateMath = A.DataType.DateMath,

    _formatter = function(mask) {
        return function(date) {
            var instance = this;
            var scheduler = instance.get('scheduler');

            return A.DataType.Date.format(
                date, {
                    format: mask,
                    locale: scheduler.get('locale')
                }
            );
        };
    },

    _numericSort = function(arr) {
        return AArray.map(arr, function(v) {
            return +v;
        }).sort(AArray.numericSort);
    },

    _numericSort = function(arr) {
        return AArray.map(arr, function(v) {
            return +v;
        }).sort(AArray.numericSort);
    },

    getCN = A.getClassName,

    CSS_CONTAINER = getCN('scheduler-view-agenda', 'container'),
    CSS_EVENT = getCN('scheduler-view-agenda', 'event'),
    CSS_EVENT_COLOR = getCN('scheduler-view-agenda', 'event', 'color'),
    CSS_EVENT_CONTENT = getCN('scheduler-view-agenda', 'event', 'content'),
    CSS_EVENT_DATES = getCN('scheduler-view-agenda', 'event', 'dates'),
    CSS_EVENT_FIRST = getCN('scheduler-view-agenda', 'event', 'first'),
    CSS_EVENT_INFO = getCN('scheduler-view-agenda', 'info'),
    CSS_EVENT_INFO_BIGGIE = getCN('scheduler-view-agenda', 'info', 'biggie'),
    CSS_EVENT_INFO_CONTAINER = getCN('scheduler-view-agenda', 'info', 'container'),
    CSS_EVENT_INFO_LABEL = getCN('scheduler-view-agenda', 'info', 'label'),
    CSS_EVENT_INFO_LABEL_BIGGIE = getCN('scheduler-view-agenda', 'info', 'label', 'biggie'),
    CSS_EVENT_INFO_LABEL_SMALL = getCN('scheduler-view-agenda', 'info', 'label', 'small'),
    CSS_EVENT_LAST = getCN('scheduler-view-agenda', 'event', 'last'),
    CSS_EVENT_NO_EVENTS = getCN('scheduler-view-agenda', 'no', 'events'),
    CSS_EVENT_PAST = getCN('scheduler-view-agenda', 'event', 'past'),
    CSS_EVENTS = getCN('scheduler-view-agenda', 'events'),
    CSS_HEADER = getCN('scheduler-view-agenda', 'header'),
    CSS_HEADER_DAY = getCN('scheduler-view-agenda', 'header', 'day'),
    CSS_HEADER_EXTRA = getCN('scheduler-view-agenda', 'header', 'extra'),
    CSS_HEADER_FIRST = getCN('scheduler-view-agenda', 'header', 'first'),
    CSS_HEADER_LAST = getCN('scheduler-view-agenda', 'header', 'last'),
    CSS_CLEARFIX = getCN('clearfix'),

    TPL_CONTAINER = '<div class="' + CSS_CONTAINER + '">{content}</div>',

    TPL_EVENTS_HEADER = '<div class="' + [CSS_HEADER, CSS_CLEARFIX].join(' ') +
        ' {firstClassName} {lastClassName}">' +
        '<div class="' + CSS_HEADER_DAY + '">{day}</div>' +
        '<a href="javascript:;" class="' + CSS_HEADER_EXTRA + '" data-timestamp="{timestamp}">{extra}</a>' +
        '</div>',

    TPL_EVENTS_CONTAINER = '<div class="' + CSS_EVENTS + '">{content}</div>',

    TPL_EVENT = '<div class="' + [CSS_EVENT, CSS_CLEARFIX].join(' ') +
        ' {firstClassName} {lastClassName} {eventClassName}" data-clientId="{clientId}">' +
        '<div class="' + CSS_EVENT_COLOR + '" style="background-color: {color};"></div>' +
        '<div class="' + CSS_EVENT_CONTENT + '">{content}</div>' +
        '<div class="' + CSS_EVENT_DATES + '">{dates}</div>' +
        '</div>',

    TPL_NO_EVENTS = '<div class="' + CSS_EVENT_NO_EVENTS + '">{content}</div>',

    TPL_INFO = '<div class="' + CSS_EVENT_INFO_CONTAINER + '">' +
        '<div class="' + [CSS_EVENT_INFO, CSS_CLEARFIX].join(' ') + '">' +
        '<div class="' + CSS_EVENT_INFO_BIGGIE + '">{day}</div>' +
        '<div class="' + CSS_EVENT_INFO_LABEL + '">' +
        '<div class="' + CSS_EVENT_INFO_LABEL_BIGGIE + '">{labelBig}</div>' +
        '<div class="' + CSS_EVENT_INFO_LABEL_SMALL + '">{labelSmall}</div>' +
        '</div>' +
        '</div>' +
        '</div>';

/**
 * A base class for `SchedulerAgendaView`.
 *
 * @class A.SchedulerAgendaViewCustom
 * @extends A.SchedulerAgendaView
 * @param {Object} config Object literal specifying widget configuration
 *     properties.
 * @constructor
 */
var SchedulerAgendaViewCustom = A.Component.create({

    /**
     * Static property provides a string to identify the class.
     *
     * @property NAME
     * @type {String}
     * @static
     */
    NAME: 'scheduler-view-agenda-custom',

    /**
     * Static property used to define which component it extends.
     *
     * @property EXTENDS
     * @type {Object}
     * @static
     */
    EXTENDS: A.SchedulerAgendaView,

    UI_ATTRS: ['daysCount'],

    ATTRS: {
        /**
         * Number to determine how many weeks back to display historic events.
         *
         * @property weeksBack
         * @type {Number}
         */
        weeksBack: {
            validator: A.Lang.isNumber,
            value: 1
        }
    },

    prototype: {
        // plotEvents is custom to this component to replace the functionality of the base aui component.
        plotEvents: function() {
            var instance = this,

            strings = instance.get('strings'),

            scheduler = instance.get('scheduler'),

            viewDate = scheduler.get('viewDate'),

            eventsDateFormatter = instance.get('eventsDateFormatter'),

            headerDayDateFormatter = instance.get('headerDayDateFormatter'),

            headerExtraDateFormatter = instance.get('headerExtraDateFormatter'),

            infoDayDateFormatter = instance.get('infoDayDateFormatter'),

            infoLabelBigDateFormatter = instance.get('infoLabelBigDateFormatter'),

            infoLabelSmallDateFormatter = instance.get('infoLabelSmallDateFormatter'),

            events = [],

            eventsMap = instance._getDayEventsMap(),

            days = A.Object.keys(eventsMap),

            daysLength = days.length;

            instance.set(
                'headerContent',
                A.Lang.sub(
                    TPL_INFO, {
                        day: infoDayDateFormatter.call(instance, viewDate),
                        labelBig: infoLabelBigDateFormatter.call(instance, viewDate),
                        labelSmall: infoLabelSmallDateFormatter.call(instance, viewDate)
                    }
                )
            );

            if (!A.Object.isEmpty(eventsMap)) {
                AArray.each(
                    _numericSort(days),
                    function(ts, index) {
                        var date = new Date(A.Lang.toInt(ts)),
                        schedulerEvents = eventsMap[ts],
                        schedulerEventsLength = schedulerEvents.length;

                        events.push(
                            A.Lang.sub(TPL_EVENTS_HEADER, {
                                day: headerDayDateFormatter.call(instance, date),
                                extra: headerExtraDateFormatter.call(instance, date),
                                firstClassName: (index === 0) ? CSS_HEADER_FIRST : '',
                                lastClassName: (index === daysLength - 1) ? CSS_HEADER_LAST : '',
                                timestamp: ts
                            })
                        );

                        AArray.each(
                            schedulerEvents,
                            function(schedulerEvent, seIndex) {
                                var today = DateMath.toMidnight(new Date()),
                                endDate = schedulerEvent.get('endDate'),
                                startDate = schedulerEvent.get('startDate');

                                events.push(
                                    A.Lang.sub(TPL_EVENT, {
                                        clientId: schedulerEvent.get('clientId'),
                                        color: schedulerEvent.get('color'),
                                        content: schedulerEvent.get('content'),
                                        dates: eventsDateFormatter.call(instance, startDate, endDate),
                                        eventClassName: ((date.getTime() < today.getTime()) || (endDate.getTime() < today.getTime())) ?
                                        CSS_EVENT_PAST : '',
                                        firstClassName: (seIndex === 0) ? CSS_EVENT_FIRST : '',
                                        lastClassName: (seIndex === schedulerEventsLength - 1) ? CSS_EVENT_LAST : ''
                                    })
                                );
                            }
                        );
                    }
                );
            }
            else {
                events.push(
                    A.Lang.sub(TPL_NO_EVENTS, {
                        content: strings.noEvents
                    })
                );
            }

            var content = A.Lang.sub(TPL_CONTAINER, {
                content: A.Lang.sub(TPL_EVENTS_CONTAINER, {
                    content: events.join('')
                })
            });

            instance.set('bodyContent', content);
        },

        /**
         * Returns the current day's `eventMap`.
         *
         * @method _getDayEventsMap
         * @protected
         * @return {Object} The current day's `eventMap`.
         */
        _getDayEventsMap: function() {
            var instance = this,

                daysCount = instance.get('daysCount'),

                scheduler = instance.get('scheduler'),

                weeksBack = instance.get('weeksBack'),

                viewDate = DateMath.toMidnight(scheduler.get('viewDate')),

                limitDate = DateMath.add(viewDate, DateMath.DAY, daysCount-1),

                lastWeek = DateMath.add(viewDate, DateMath.DAY, weeksBack * -7),

                eventsMap = {};

            scheduler.eachEvent(
                function(schedulerEvent) {
                    var endDate = schedulerEvent.get('endDate'),
                        startDate = schedulerEvent.get('startDate'),
                        visible = schedulerEvent.get('visible'),
                        dayTS;

                    if (!visible) {
                        return;
                    }

                    var displayDate = startDate;

                    if (DateMath.before(limitDate, endDate)) {
                        endDate = limitDate;
                    }

                    while (displayDate.getTime() <= endDate.getTime()) {
                        if (displayDate.getTime() >= lastWeek.getTime()) {
                            dayTS = DateMath.safeClearTime(displayDate).getTime();

                            if (!eventsMap[dayTS]) {
                                eventsMap[dayTS] = [];
                            }

                            eventsMap[dayTS].push(schedulerEvent);
                        }

                        displayDate = DateMath.add(displayDate, DateMath.DAY, 1);
                    }
                }
            );

            return eventsMap;
        }
    }
});

A.SchedulerAgendaViewCustom = SchedulerAgendaViewCustom;