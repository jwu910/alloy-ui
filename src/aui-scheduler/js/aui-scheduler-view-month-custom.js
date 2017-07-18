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
    CSS_SVT_COLGRID = getCN('scheduler-view', 'table', 'colgrid'),
    CSS_SVT_COLGRID_FIRST = getCN('scheduler-view', 'table', 'colgrid', 'first'),
    CSS_SVT_COLGRID_TODAY = getCN('scheduler-view', 'table', 'colgrid', 'today'),

    CSS_SVT_TABLE_DATA_COL_TITLE = getCN('scheduler-view', 'table', 'data', 'col', 'title'),

    TPL_SVT_GRID_COLUMN = '<td class="' + CSS_SVT_COLGRID + '">&nbsp;</td>';
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
            value: true
        }
    },

    EXTENDS: A.SchedulerMonthView,

    prototype: {

        /**
         * Updates the `SchedulerTableView`'s column grid by moving styling to
         * the current day cell `Node`.
         *
         * @method syncGridUI
         */
        disablePastDates: function() {
            var instance = this;
            var scheduler = instance.get('scheduler');
            var todayDate = scheduler.get('todayDate');

            var intervalStartDate = instance._findCurrentIntervalStart();
            var intervalEndDate = instance._findCurrentIntervalEnd();

            if (DateMath.between(todayDate, intervalStartDate, intervalEndDate)) {
                var firstDayOfWeek = scheduler.get('firstDayOfWeek');
                var firstWeekDay = instance._findFirstDayOfWeek(todayDate);

                var rowIndex = DateMath.getWeekNumber(todayDate, firstDayOfWeek) - DateMath.getWeekNumber(
                    intervalStartDate, firstDayOfWeek);
                var colIndex = (todayDate.getDate() - firstWeekDay.getDate());
                var celIndex = instance._getCellIndex([colIndex, rowIndex]);

                var todayCel = instance.columnTableGrid.item(celIndex);

                // Add 'disabled' class to cell indexes on current calender
                for (i = 0; i < instance.columnTableGrid._nodes.length; i++) {
                    if (i < celIndex) {
                        instance.columnTableGrid.item(i).addClass('disabled');
                    }
                    // instance.columnTableGrid.item(i).on

                }

                // DEBUG need to disable previous months too.

                // if (todayCel) {
                //     todayCel.addClass(CSS_SVT_COLGRID_TODAY);
                // }
            }
        },

    }
});

A.SchedulerMonthViewCustom = SchedulerMonthViewCustom;