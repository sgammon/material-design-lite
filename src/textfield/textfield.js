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
goog.require('goog.events.EventType');
goog.require('goog.dom.TagName');


/**
 * Store constants in one place so they can be updated easily.
 *
 * @enum {string | number}
 * @private
 */
const MaterialTextfieldConstant_ = {
  NO_MAX_ROWS: -1,
  MAX_ROWS_ATTRIBUTE: 'maxrows'
};

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialTextfieldClasses_ = {
  LABEL: goog.getCssName('mdl-textfield__label'),
  INPUT: goog.getCssName('mdl-textfield__input'),
  IS_DIRTY: goog.getCssName('is-dirty'),
  IS_FOCUSED: goog.getCssName('is-focused'),
  IS_DISABLED: goog.getCssName('is-disabled'),
  IS_INVALID: goog.getCssName('is-invalid'),
  IS_UPGRADED: goog.getCssName('is-upgraded'),
  HAS_PLACEHOLDER: goog.getCssName('has-placeholder')
};

/**
 * Class constructor for Textfield MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
const MaterialTextfield = function MaterialTextfield(element) {
  /**
   * Target HTML element to upgrade.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.element_ = element;

  /**
   * Maximum number of rows for this text field.
   *
   * @public
   * @type {number}
   */
  this.maxRows = MaterialTextfieldConstant_.NO_MAX_ROWS;
};

/**
 * Handle input being entered.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTextfield.prototype.onKeyDown_ = function(event) {
  var currentRowCount = event.target.value.split('\n').length;
  if (event.keyCode === 13) {
    if (currentRowCount >= MaterialTextfieldConstant_.NO_MAX_ROWS) {
      event.preventDefault();
    }
  }
};

/**
 * Handle focus.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTextfield.prototype.onFocus_ = function(event) {
  this.element_.classList.add(MaterialTextfieldClasses_.IS_FOCUSED);
};

/**
 * Handle lost focus.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTextfield.prototype.onBlur_ = function(event) {
  this.element_.classList.remove(MaterialTextfieldClasses_.IS_FOCUSED);
};

/**
 * Handle reset event from out side.
 *
 * @param {Event} event The event that fired.
 * @private
 */
MaterialTextfield.prototype.onReset_ = function(event) {
  this.updateClasses_();
};

/**
 * Handle class updates.
 *
 * @private
 */
MaterialTextfield.prototype.updateClasses_ = function() {
  this.checkDisabled();
  this.checkValidity();
  this.checkDirty();
  this.checkFocus();
};

// Public methods.

/**
 * Check the disabled state and update field accordingly.
 *
 * @public
 */
MaterialTextfield.prototype.checkDisabled = function() {
  if (this.input_.disabled) {
    this.element_.classList.add(MaterialTextfieldClasses_.IS_DISABLED);
  } else {
    this.element_.classList.remove(MaterialTextfieldClasses_.IS_DISABLED);
  }
};

/**
* Check the focus state and update field accordingly.
*
* @public
*/
MaterialTextfield.prototype.checkFocus = function() {
  if (Boolean(this.element_.querySelector(':focus'))) {
    this.element_.classList.add(MaterialTextfieldClasses_.IS_FOCUSED);
  } else {
    this.element_.classList.remove(MaterialTextfieldClasses_.IS_FOCUSED);
  }
};

/**
 * Check the validity state and update field accordingly.
 *
 * @public
 */
MaterialTextfield.prototype.checkValidity = function() {
  if (this.input_.validity) {
    if (this.input_.validity.valid) {
      this.element_.classList.remove(MaterialTextfieldClasses_.IS_INVALID);
    } else {
      this.element_.classList.add(MaterialTextfieldClasses_.IS_INVALID);
    }
  }
};

/**
 * Check the dirty state and update field accordingly.
 *
 * @public
 */
MaterialTextfield.prototype.checkDirty = function() {
  if (
    (this.input_.value && this.input_.value.length > 0) ||
    (this.input_.placeholder.trim() !== '')
  ) {
    this.element_.classList.add(MaterialTextfieldClasses_.IS_DIRTY);
  } else {
    this.element_.classList.remove(MaterialTextfieldClasses_.IS_DIRTY);
  }
};

/**
 * Disable text field.
 *
 * @public
 */
MaterialTextfield.prototype.disable = function() {
  this.input_.setAttribute('disabled', 'disabled');
  this.updateClasses_();
};

/**
 * Enable text field.
 *
 * @public
 */
MaterialTextfield.prototype.enable = function() {
  this.input_.removeAttribute('disabled');
  this.updateClasses_();
};

/**
 * Update text field value.
 *
 * @param {string} value The value to which to set the control (optional).
 * @public
 */
MaterialTextfield.prototype.change = function(value) {
  this.input_.setAttribute(value || '');
  this.updateClasses_();
};

/**
 * Initialize element.
 */
MaterialTextfield.prototype.init = function() {

  if (this.element_) {
    this.label_ = this.element_.querySelector('.' + MaterialTextfieldClasses_.LABEL);
    this.input_ = this.element_.querySelector('.' + MaterialTextfieldClasses_.INPUT);

    if (this.input_) {
      if (this.input_.hasAttribute(
            /** @type {string} */ (MaterialTextfieldConstant_.MAX_ROWS_ATTRIBUTE))) {
        this.maxRows = parseInt(this.input_.getAttribute(
            /** @type {string} */ (MaterialTextfieldConstant_.MAX_ROWS_ATTRIBUTE)), 10);
        if (isNaN(this.maxRows)) {
          this.maxRows = MaterialTextfieldConstant_.NO_MAX_ROWS;
        }
      }

      if (this.input_.hasAttribute('placeholder')) {
        this.element_.classList.add(MaterialTextfieldClasses_.HAS_PLACEHOLDER);
      }

      this.boundUpdateClassesHandler = this.updateClasses_.bind(this);
      this.boundFocusHandler = this.onFocus_.bind(this);
      this.boundBlurHandler = this.onBlur_.bind(this);
      this.boundResetHandler = this.onReset_.bind(this);
      this.input_.addEventListener(goog.events.EventType.INPUT, this.boundUpdateClassesHandler);
      this.input_.addEventListener(goog.events.EventType.FOCUS, this.boundFocusHandler);
      this.input_.addEventListener(goog.events.EventType.BLUR, this.boundBlurHandler);
      this.input_.addEventListener(goog.events.EventType.RESET, this.boundResetHandler);

      if (this.maxRows !== MaterialTextfieldConstant_.NO_MAX_ROWS) {
        // TODO: This should handle pasting multi line text.
        // Currently doesn't.
        this.boundKeyDownHandler = this.onKeyDown_.bind(this);
        this.input_.addEventListener(goog.events.EventType.KEYDOWN, this.boundKeyDownHandler);
      }
      var invalid = this.element_.classList
        .contains(MaterialTextfieldClasses_.IS_INVALID);
      this.updateClasses_();
      this.element_.classList.add(MaterialTextfieldClasses_.IS_UPGRADED);
      if (invalid) {
        this.element_.classList.add(MaterialTextfieldClasses_.IS_INVALID);
      }
      if (this.input_.hasAttribute('autofocus')) {
        this.element_.focus();
        this.checkFocus();
      }
    }
  }
};

// The component registers itself. It can assume componentHandler is available
// in the global scope.
// componentHandler.register({
//   constructor: MaterialTextfield,
//   classAsString: 'MaterialTextfield',
//   cssClass: 'mdl-js-textfield',
//   widget: true
// });
