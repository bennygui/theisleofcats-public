/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * theisleofcatsbennygui implementation : © Guillaume Benny bennygui@gmail.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

define(
    [
        'dojo',
        'dojo/_base/declare',
    ],
    (dojo, declare) => {
        return declare(
            'tioc.Scheduler',
            null, {
                SCHEDULER_DEFAULT_TIMEOUT: 50,
                callbackFct: null,
                timeout: null,
                timer: null,

                constructor(callbackFct, timeout = null) {
                    this.callbackFct = callbackFct;
                    this.timeout = timeout;
                    if (this.timeout === null) {
                        this.timeout = this.SCHEDULER_DEFAULT_TIMEOUT;
                    }
                },
                schedule() {
                    this.unschedule();
                    this.timer = setTimeout(() => {
                        window.tiocWrap('Scheduler_setTimeout', () => {
                            this.callbackFct();
                        });
                    }, this.timeout);
                },
                scheduleNow() {
                    this.unschedule();
                    this.callbackFct();
                },
                unschedule() {
                    if (this.timer !== null) {
                        clearTimeout(this.timer);
                    }
                },
            }
        );
    }
);