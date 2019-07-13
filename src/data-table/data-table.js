/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global goog */

goog.require('componentHandler.register');
goog.require('componentHandler.xid');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');
goog.require('material.MaterialCheckbox');

goog.provide('material.MaterialDataTable');


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialDataTableCssClasses_ = {
  DATA_TABLE: goog.getCssName('mdl-data-table'),
  SELECTABLE: goog.getCssName('mdl-data-table--selectable'),
  SELECT_ELEMENT: goog.getCssName('mdl-data-table__select'),
  IS_SELECTED: goog.getCssName('is-selected'),
  IS_UPGRADED: goog.getCssName('is-upgraded'),
  CHECKBOX: goog.getCssName('mdl-checkbox'),
  JS_CHECKBOX: goog.getCssName('mdl-js-checkbox'),
  RIPPLE: goog.getCssName('mdl-js-ripple-effect'),
  JS_CHECKBOX_INPUT: goog.getCssName('mdl-checkbox__input')
};

/**
 * Class constructor for Data Table Card MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialDataTable = function MaterialDataTable(element) {
  const tdName = goog.dom.TagName.TD.toString();
  const thName = goog.dom.TagName.TH.toString();

  /**
   * Root HTML element for the MDL data table.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.element_ = element;

  // Initialize instance.
  const firstHeader = this.element_.querySelector(thName);
  const bodyRows = Array.prototype.slice.call(this.element_.querySelectorAll('tbody tr'));
  const footRows = Array.prototype.slice.call(this.element_.querySelectorAll('tfoot tr'));
  const rows = bodyRows.concat(footRows);

  /**
   * Header checkbox element, mounted if the table is marked as selectable.
   *
   * @const
   * @private
   * @type {?HTMLElement}
   */
  this.headerCheckbox = this.element_.classList.contains(MaterialDataTableCssClasses_.SELECTABLE) ?
    this.createCheckbox_(null, rows) : null;

  /**
   * MDL header checkbox component.
   *
   * @const
   * @private
   * @type {?material.MaterialCheckbox}
   */
  this.mdlHeaderCheckbox = !!this.headerCheckbox ?
    new material.MaterialCheckbox(/** @type {!HTMLElement} */ (this.headerCheckbox)) : null;

  let rowCheckboxes = [];
  if (this.element_.classList.contains(MaterialDataTableCssClasses_.SELECTABLE)) {
    const th = document.createElement(thName);

    th.appendChild(this.headerCheckbox);
    firstHeader.parentElement.insertBefore(th, firstHeader);

    for (let i = 0; i < rows.length; i++) {
      let firstCell = rows[i].querySelector(tdName);
      if (firstCell) {
        let td = document.createElement(tdName);
        if (rows[i].parentNode.nodeName.toUpperCase() === 'TBODY') {
          let checkboxEl = this.createCheckbox_(rows[i]);
          rowCheckboxes.push(new material.MaterialCheckbox(checkboxEl));
          td.appendChild(checkboxEl);
        }
        rows[i].insertBefore(td, firstCell);
      }
    }
  }
  this.element_.classList.add(MaterialDataTableCssClasses_.IS_UPGRADED);

  /**
   * Keeps track of managed checkboxes in each row, if the table is selectable.
   *
   * @const
   * @private
   * @type {!Array<!material.MaterialCheckbox>}
   */
  this.rowCheckboxes_ = rowCheckboxes;
};

/**
 * Generates and returns a function that toggles the selection state of a
 * single row (or multiple rows).
 *
 * @param {!HTMLInputElement} checkbox Checkbox that toggles the selection state.
 * @param {?HTMLElement} row Row to toggle when checkbox changes.
 * @param {(!Array<!Object>|!NodeList)=} opt_rows Rows to toggle when checkbox changes.
 * @return {function(): void|null} Function that handles row selection events.
 * @private
 */
material.MaterialDataTable.prototype.selectRow_ = function(checkbox, row, opt_rows) {
  if (row) {
    /**
     * Callback function, prepared to handle row selection events.
     *
     * @private
     */
    function rowCallback_() {
      if (checkbox.checked) {
        row.classList.add(MaterialDataTableCssClasses_.IS_SELECTED);
      } else {
        row.classList.remove(MaterialDataTableCssClasses_.IS_SELECTED);
        if (this.mdlHeaderCheckbox.isChecked()) {
          this.mdlHeaderCheckbox.uncheck();
        }
      }
    }
    return rowCallback_.bind(this);
  }

  if (opt_rows) {
    /**
     * Callback function, prepared to handle row selection events.
     *
     * @private
     */
    function multiRowCallback_() {
      let i;
      let cbox;
      if (checkbox.checked) {
        for (i = 0; i < opt_rows.length; i++) {
          cbox = this.rowCheckboxes_[i];
          cbox.check();
          opt_rows[i].classList.add(MaterialDataTableCssClasses_.IS_SELECTED);
        }
      } else {
        for (i = 0; i < opt_rows.length; i++) {
          cbox = this.rowCheckboxes_[i];
          cbox.uncheck();
          opt_rows[i].classList.remove(MaterialDataTableCssClasses_.IS_SELECTED);
        }
      }
    }
    return multiRowCallback_.bind(this);
  }
  return null;
};

/**
 * Creates a checkbox for a single or or multiple rows and hooks up the
 * event handling.
 *
 * @param {?Element} row Row to toggle when checkbox changes.
 * @param {(!Array<!Object>|!NodeList)=} opt_rows Rows to toggle when checkbox changes.
 * @return {!HTMLElement} Prepared checkbox element, pre-MDL.
 * @private
 */
material.MaterialDataTable.prototype.createCheckbox_ = function(row, opt_rows) {
  const labelTag = goog.dom.TagName.LABEL.toString();
  const inputTag = goog.dom.TagName.INPUT.toString();
  const label = document.createElement(labelTag);
  const labelClasses = [
    MaterialDataTableCssClasses_.CHECKBOX,
    MaterialDataTableCssClasses_.JS_CHECKBOX,
    MaterialDataTableCssClasses_.RIPPLE,
    MaterialDataTableCssClasses_.SELECT_ELEMENT
  ];
  label.className = labelClasses.join(' ');
  const checkbox = /** @type {!HTMLInputElement} */ (document.createElement(inputTag));
  checkbox.type = 'checkbox';
  checkbox.classList.add(MaterialDataTableCssClasses_.JS_CHECKBOX_INPUT);

  if (row) {
    checkbox.checked = row.classList.contains(MaterialDataTableCssClasses_.IS_SELECTED);
    checkbox.addEventListener(goog.events.EventType.CHANGE,
      this.selectRow_(
        /** @type {!HTMLInputElement} */ (checkbox),
        /** @type {!HTMLElement} */ (row)));
  } else if (opt_rows) {
    checkbox.addEventListener(goog.events.EventType.CHANGE,
      this.selectRow_(
        /** @type {!HTMLInputElement} */ (checkbox),
        null,
        opt_rows));
  }

  label.appendChild(checkbox);
  return /** @type {!HTMLElement} */ (label);
};


componentHandler.register({
  constructor: material.MaterialDataTable,
  classAsString: componentHandler.xid('MaterialDataTable'),
  cssClass: goog.getCssName('mdl-js-data-table')
});
