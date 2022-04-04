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
        g_gamethemeurl + "modules/js/Scheduler.js",
    ],
    (dojo, declare) => {
        return declare(
            'tioc.ElementSorter',
            null, {
                SCHEDULE_TIMEOUT: 100,

                elementIdSet: null,
                elementIdParallelSet: null,
                childSelector: null,
                sorterFunction: null,
                childToRemoveFunction: null,
                insertChildFunction: null,
                afterSortFunction: null,
                scheduler: null,

                constructor(childSelector, sorterFunction, childToRemoveFunction = null, insertChildFunction = null, afterSortFunction = null) {
                    this.elementIdSet = new Set();
                    this.elementIdParallelSet = new Set();
                    this.childSelector = childSelector;
                    this.sorterFunction = sorterFunction;
                    this.childToRemoveFunction = (childToRemoveFunction === null ? this.childToRemoveDefault : childToRemoveFunction);
                    this.insertChildFunction = (insertChildFunction === null ? this.insertChildDefault : insertChildFunction);
                    this.afterSortFunction = (afterSortFunction === null ? () => {} : afterSortFunction);
                    this.scheduler = new tioc.Scheduler(() => this._sortAll(), this.SCHEDULE_TIMEOUT);
                },
                schedule() {
                    this.scheduler.schedule();
                },
                scheduleNow() {
                    this.scheduler.scheduleNow();
                },
                addElementId(id, parallel = false) {
                    this.elementIdSet.add(id);
                    if (parallel) {
                        this.elementIdParallelSet.add(id);
                    }
                    this.schedule();
                },
                _sortAll() {
                    const idToChildMap = {}
                    for (const id of this.elementIdSet) {
                        const elem = document.getElementById(id);
                        if (elem === null) {
                            continue;
                        }
                        const childElements = Array.from(this.childToRemoveFunction(id, this.childSelector));
                        for (const c of childElements) {
                            if (c.classList.contains('tioc-moving') || getComputedStyle(c).position == 'absolute') {
                                this.schedule();
                                return;
                            }
                        }
                        idToChildMap[id] = childElements;
                    }
                    let parallelLength = 0;
                    for (const id in idToChildMap) {
                        const childElements = idToChildMap[id];
                        this._removeChildElements(childElements);
                        this._sort(childElements);
                        if (this.elementIdParallelSet.has(id)) {
                            parallelLength = Math.max(parallelLength, childElements.length);
                        } else {
                            this._insertChildElements(id, childElements);
                        }
                    }
                    for (let i = 0; i < parallelLength; ++i) {
                        for (const id in idToChildMap) {
                            if (!this.elementIdParallelSet.has(id)) {
                                continue;
                            }
                            const childElements = idToChildMap[id];
                            if (i < childElements.length) {
                                this._insertChildElements(id, [childElements[i]]);
                            }
                        }
                    }
                    this.afterSortFunction();
                },
                _removeChildElements(childElements) {
                    for (const c of childElements) {
                        c.remove();
                    }
                },
                _sort(childElements) {
                    childElements.sort(this.sorterFunction);
                },
                _insertChildElements(id, childElements) {
                    this.insertChildFunction(id, childElements);
                },
                childToRemoveDefault(id, childSelector) {
                    return document.querySelectorAll('#' + id + ' ' + childSelector);
                },
                insertChildDefault(id, childElements) {
                    const sortElement = document.getElementById(id);
                    for (const c of childElements) {
                        sortElement.appendChild(c);
                    }
                },
            }
        );
    }
);