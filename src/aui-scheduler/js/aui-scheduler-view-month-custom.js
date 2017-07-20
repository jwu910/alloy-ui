/**
 * The Scheduler Component
 *
 * @module aui-scheduler
 * @submodule aui-scheduler-view-month
 */

var Lang = A.Lang,
    isFunction = Lang.isFunction,

    DateMath = A.DataType.DateMath,

    WEEK_LENGTH = DateMath.WEEK_LENGTH,

    getCN = A.getClassName,

    CSS_SVM_TABLE_DATA_COL_NOMONTH = getCN('scheduler-view-month', 'table', 'data', 'col', 'nomonth'),
    CSS_SVT_TABLE_DATA_COL = getCN('scheduler-view', 'table', 'data', 'col'),

    CSS_SVT_COLGRID = getCN('scheduler-view', 'table', 'colgrid'),
    CSS_SVT_COLGRID_FIRST = getCN('scheduler-view', 'table', 'colgrid', 'first'),
    CSS_SVT_COLGRID_TODAY = getCN('scheduler-view', 'table', 'colgrid', 'today'),
    CSS_SVT_MORE = getCN('scheduler-view', 'table', 'more'),

    CSS_SVT_TABLE_DATA = getCN('scheduler-view', 'table', 'data'),
    CSS_SVT_TABLE_DATA_COL = getCN('scheduler-view', 'table', 'data', 'col'),
    CSS_SVT_TABLE_DATA_COL_TITLE = getCN('scheduler-view', 'table', 'data', 'col', 'title'),
    CSS_SVT_TABLE_DATA_COL_TITLE_DOWN = getCN('scheduler-view', 'table', 'data', 'col', 'title', 'down'),
    CSS_SVT_TABLE_DATA_COL_TITLE_FIRST = getCN('scheduler-view', 'table', 'data', 'col', 'title', 'first'),
    CSS_SVT_TABLE_DATA_COL_TITLE_NEXT = getCN('scheduler-view', 'table', 'data', 'col', 'title', 'next'),
    CSS_SVT_TABLE_DATA_COL_TITLE_TODAY = getCN('scheduler-view', 'table', 'data', 'col', 'title', 'today'),
    CSS_SVT_TABLE_DATA_EVENT = getCN('scheduler-view', 'table', 'data', 'event'),
    CSS_SVT_TABLE_DATA_EVENT_LEFT = getCN('scheduler-view', 'table', 'data', 'event', 'left'),
    CSS_SVT_TABLE_DATA_EVENT_RIGHT = getCN('scheduler-view', 'table', 'data', 'event', 'right'),
    CSS_SVT_TABLE_DATA_FIRST = getCN('scheduler-view', 'table', 'data', 'first'),
    CSS_SVT_TABLE_GRID = getCN('scheduler-view', 'table', 'grid'),
    CSS_SVT_TABLE_GRID_CONTAINER = getCN('scheduler-view', 'table', 'grid', 'container'),
    CSS_SVT_TABLE_GRID_FIRST = getCN('scheduler-view', 'table', 'grid', 'first'),

    TPL_SVT_MORE = '<a href="javascript:;" class="' + CSS_SVT_MORE + '">{showMoreLabel}</a>',

    TPL_SVT_GRID_COLUMN = '<td class="' + CSS_SVT_COLGRID + '">&nbsp;</td>',
    TPL_SVT_TABLE_DATA_COL = '<td class="' + CSS_SVT_TABLE_DATA_COL + '"><div></div></td>',
    TPL_SVT_TABLE_DATA_ROW = '<tr></tr>';
/**
 * A base class for `SchedulerMonthViewCustom`.
 *
 * @class A.SchedulerMonthViewCustom
 * @extends A.SchedulerMonthView
 * @param {Object} config Object literal specifying widget configuration
 *     properties.
 * @constructor
 */
var SchedulerMonthViewCustom = A.Component.create({

    /**
     * Static property provides a string to identify the class.
     *
     * @property NAME
     * @type {String}
     * @static
     */
    NAME: 'scheduler-view-month-custom',

    /**
     * Static property used to define the default attribute
     * configuration for the `SchedulerMonthView`.
     *
     * @property ATTRS
     * @type {Object}
     * @static
     */
    ATTRS: {
        disablePast: {
            value: false
        }
    },

    EXTENDS: A.SchedulerMonthView,

    prototype: {
        /**
         * Handle `mouseDownGrid` events.
         *
         * @method _onMouseDownGrid
         * @param {EventFacade} event
         * @protected
         */
        _onMouseDownGrid: function(event) {
            var instance = this;
            var scheduler = instance.get('scheduler');
            var recorder = scheduler.get('eventRecorder');
            var target = event.target;

            var handleMouseDown = function() {
                if (recorder && !scheduler.get('disabled') &&
                target.test(['.' + CSS_SVT_COLGRID, '.' + CSS_SVT_TABLE_DATA_COL].join())) {

                    instance._recording = true;

                    instance._syncCellDimensions();

                    var eventXY = instance._offsetXY([event.pageX, event.pageY], -1);

                    instance.lassoStartPosition = instance.lassoLastPosition = instance._findPosition(eventXY);

                    instance.renderLasso(instance.lassoStartPosition, instance.lassoLastPosition);

                    instance.rowsContainerNode.unselectable();
                }
            }

            if (instance.get('disablePast')) {
                // Check if target is not disabled.
                if (!target.hasClass('disabled')) {
                    handleMouseDown();
                }
            }
            else {
                handleMouseDown();
            }
        },

        /**
         * Updates the `SchedulerTableView`'s column grid by disabling days that
         * fall before the current day cell `Node`.
         *
         * @method disablePastDates
         */
        disablePastDates: function() {
            var instance = this;
            var scheduler = instance.get('scheduler');
            var todayDate = scheduler.get('todayDate');
            var titleRowNode = A.Node.create(TPL_SVT_TABLE_DATA_ROW);

            var intervalStartDate = instance._findCurrentIntervalStart();
            var intervalEndDate = instance._findCurrentIntervalEnd();

            var disableDates = function() {
                for (i = 0; i < instance.columnTableGrid._nodes.length; i++) {
                    var celDate = DateMath.add(intervalStartDate, DateMath.DAY, i);
                    var currentGridItem = instance.columnTableGrid.item(i);

                    currentGridItem.removeClass('disabled');

                    if (celDate < todayDate) {
                        currentGridItem.addClass('disabled');
                    }
                    else {
                        currentGridItem.removeClass('disabled');
                    }
                }
            };

            if (DateMath.between(todayDate, intervalStartDate, intervalEndDate) || todayDate > intervalStartDate) {
                var firstDayOfWeek = scheduler.get('firstDayOfWeek');
                var firstWeekDay = instance._findFirstDayOfWeek(todayDate);

                var rowIndex = DateMath.getWeekNumber(todayDate, firstDayOfWeek) - DateMath.getWeekNumber(
                    intervalStartDate, firstDayOfWeek);
                var colIndex = (todayDate.getDate() - firstWeekDay.getDate());
                var celIndex = instance._getCellIndex([colIndex, rowIndex]);

                var todayCel = instance.columnTableGrid.item(celIndex);

                // Add 'disabled' class to cell indexes on current calender
                disableDates();
            }
            else if (todayDate < intervalStartDate) {
                for (i = 0; i < instance.columnTableGrid._nodes.length; i++) {
                    instance.columnTableGrid.item(i).removeClass('disabled');
                }
            }
        },

        /**
         * Builds a row of events.
         *
         * @method buildEventsRow
         * @param {Date} rowStartDate
         * @param {Date} rowEndDate
         * @param {Number} rowDisplayIndex
         * @return {Node}
         */
        buildEventsRow: function(rowStartDate, rowEndDate, rowDisplayIndex) {
            var instance = this;
            var displayRows = instance.get('displayRows');

            var rowRenderedColumns = 0;
            var rowNode = A.Node.create(TPL_SVT_TABLE_DATA_ROW);
            var todayDate = instance.get('scheduler').get('todayDate');
            var renderedEvents = false;

            instance.loopDates(rowStartDate, rowEndDate, function(celDate, index) {
                var key = instance._getEvtRenderedStackKey(celDate);

                var evtRenderedStack = instance.evtRenderedStack[key];

                if (!evtRenderedStack) {
                    instance.evtRenderedStack[key] = [];

                    evtRenderedStack = instance.evtRenderedStack[key];
                }

                if (rowRenderedColumns > index) {
                    evtRenderedStack.push(null);

                    return;
                }

                var events = instance.evtDateStack[key];
                if (!events) {
                    events = [];
                }

                events = A.Array.filter(events, function(currEvent) {
                    return currEvent.get('visible');
                });

                var evt = instance._getRenderableEvent(events, rowStartDate, rowEndDate, celDate);

                var evtColNode = A.Node.create(TPL_SVT_TABLE_DATA_COL);
                var evtNodeContainer = evtColNode.one('div');

                // If current Node date occurs before today, disable.
                if (instance.get('disablePast')) {
                    if (celDate < todayDate) {
                        evtColNode.addClass('disabled')
                    }
                    else {
                        evtColNode.removeClass('disabled')
                    }
                }

                if ((evtRenderedStack.length < events.length) && displayRows && (rowDisplayIndex === (displayRows - 1))) {
                    var strings = instance.get('strings');

                    var showMoreLabel = Lang.sub(
                        strings.showMore,
                        [
                            (events.length - evtRenderedStack.length)
                        ]
                    );

                    var showMoreEventsLink = A.Node.create(
                        Lang.sub(
                            TPL_SVT_MORE, {
                                showMoreLabel: showMoreLabel
                            }
                        )
                    );

                    showMoreEventsLink.setData('events', events);

                    evtNodeContainer.append(showMoreEventsLink);
                    renderedEvents = true;
                }
                else if (evt) {
                    var evtSplitInfo = instance._getEvtSplitInfo(evt, celDate, rowStartDate, rowEndDate);

                    evtColNode.attr('colspan', evtSplitInfo.colspan);

                    rowRenderedColumns += (evtSplitInfo.colspan - 1);

                    instance._syncEventNodeContainerUI(evt, evtNodeContainer, evtSplitInfo);
                    instance._syncEventNodeUI(evt, evtNodeContainer, celDate);

                    evtRenderedStack.push(evt);
                    renderedEvents = true;
                }

                rowRenderedColumns++;

                rowNode.append(evtColNode);
            });

            return renderedEvents ? rowNode : null;
        },

        /**
         * Builds a row with the title and today's date.
         *
         * @method buildEventsTitleRow
         * @param {Node} tableNode
         * @param {Date} rowStartDate
         * @param {Date} rowEndDate
         * @return {Node} titleRowNode The title row `Node`.
         */
        buildEventsTitleRow: function(tableNode, rowStartDate, rowEndDate) {
            var instance = this;

            var todayDate = instance.get('scheduler').get('todayDate');

            var titleRowNode = A.Node.create(TPL_SVT_TABLE_DATA_ROW);

            instance.loopDates(rowStartDate, rowEndDate, function(celDate, index) {
                var colTitleNode = A.Node.create(TPL_SVT_TABLE_DATA_COL);

                colTitleNode
                    .addClass(CSS_SVT_TABLE_DATA_COL_TITLE)
                    .toggleClass(
                        CSS_SVT_TABLE_DATA_COL_TITLE_FIRST, (index === 0))
                    .toggleClass(
                        CSS_SVT_TABLE_DATA_COL_TITLE_TODAY, !DateMath.isDayOverlap(celDate, todayDate))
                    .toggleClass(
                        CSS_SVT_TABLE_DATA_COL_TITLE_NEXT, !DateMath.isDayOverlap(
                            DateMath.subtract(celDate, DateMath.DAY, 1), todayDate))
                    .toggleClass(
                        CSS_SVT_TABLE_DATA_COL_TITLE_DOWN, !DateMath.isDayOverlap(
                            DateMath.subtract(celDate, DateMath.WEEK, 1), todayDate));

                // Check if title is older than current date, if so, disable.
                if (instance.get('disablePast')) {
                    if (celDate < todayDate) {
                        colTitleNode.addClass('disabled');
                    }
                    else {
                        colTitleNode.removeClass('disabled');
                    }
                }

                titleRowNode.append(
                    colTitleNode.setContent(celDate.getDate())
                );
            });

            return titleRowNode;
        },

        /**
         * Sets `date` on the UI.
         *
         * @method _uiSetDate
         * @protected
         */
        _uiSetDate: function() {
            var instance = this;

            instance.syncDaysHeaderUI();
            instance.syncGridUI();

            if (instance.get('disablePast')) {
                instance.disablePastDates();
            }
        }
    }
});

A.SchedulerMonthViewCustom = SchedulerMonthViewCustom;