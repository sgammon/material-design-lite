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

goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');

goog.provide('material.MaterialCheckbox');


/**
 * Timeout value for some checkbox operations/animations.
 *
 * @const {number}
 * @private
 */
const TINY_TIMEOUT = 0.001;

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialCheckboxCssClasses_ = {
  INPUT: goog.getCssName('mdl-checkbox__input'),
  BOX_OUTLINE: goog.getCssName('mdl-checkbox__box-outline'),
  FOCUS_HELPER: goog.getCssName('mdl-checkbox__focus-helper'),
  TICK_OUTLINE: goog.getCssName('mdl-checkbox__tick-outline'),
  RIPPLE_EFFECT: goog.getCssName('mdl-js-ripple-effect'),
  RIPPLE_IGNORE_EVENTS: goog.getCssName('mdl-js-ripple-effect--ignore-events'),
  RIPPLE_CONTAINER: goog.getCssName('mdl-checkbox__ripple-container'),
  RIPPLE_CENTER: goog.getCssName('mdl-ripple--center'),
  RIPPLE: goog.getCssName('mdl-ripple'),
  IS_FOCUSED: goog.getCssName('is-focused'),
  IS_DISABLED: goog.getCssName('is-disabled'),
  IS_CHECKED: goog.getCssName('is-checked'),
  IS_UPGRADED: goog.getCssName('is-upgraded')
};

/**
 * Class constructor for Checkbox MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialCheckbox = function MaterialCheckbox(element) {
  const spanTag = goog.dom.TagName.SPAN.toString();

  /**
   * Root element to attach the checkbox to.
   *
   * @const
   * @type {!HTMLElement}
   * @private
   */
  this.element_ = element;

  /**
   * Input element to use under the root element.
   *
   * @const
   * @type {!HTMLInputElement}
   * @private
   */
  this.inputElement_ = /** @type {!HTMLInputElement} */ (
    this.element_.querySelector('.' + MaterialCheckboxCssClasses_.INPUT));

  const boxOutline = document.createElement(spanTag);
  boxOutline.classList.add(MaterialCheckboxCssClasses_.BOX_OUTLINE);

  const tickContainer = document.createElement(spanTag);
  tickContainer.classList.add(MaterialCheckboxCssClasses_.FOCUS_HELPER);

  const tickOutline = document.createElement(spanTag);
  tickOutline.classList.add(MaterialCheckboxCssClasses_.TICK_OUTLINE);

  boxOutline.appendChild(tickOutline);

  this.element_.appendChild(tickContainer);
  this.element_.appendChild(boxOutline);

  if (this.element_.classList.contains(MaterialCheckboxCssClasses_.RIPPLE_EFFECT)) {
    this.element_.classList.add(MaterialCheckboxCssClasses_.RIPPLE_IGNORE_EVENTS);
    this.rippleContainerElement_ = document.createElement(spanTag);
    this.rippleContainerElement_.classList.add(MaterialCheckboxCssClasses_.RIPPLE_CONTAINER);
    this.rippleContainerElement_.classList.add(MaterialCheckboxCssClasses_.RIPPLE_EFFECT);
    this.rippleContainerElement_.classList.add(MaterialCheckboxCssClasses_.RIPPLE_CENTER);
    this.boundRippleMouseUp = this.onMouseUp_.bind(this);
    this.rippleContainerElement_.addEventListener(goog.events.EventType.MOUSEUP, this.boundRippleMouseUp);

    const ripple = document.createElement(spanTag);
    ripple.classList.add(MaterialCheckboxCssClasses_.RIPPLE);

    this.rippleContainerElement_.appendChild(ripple);
    this.element_.appendChild(this.rippleContainerElement_);
  }
  this.boundInputOnChange = this.onChange_.bind(this);
  this.boundInputOnFocus = this.onFocus_.bind(this);
  this.boundInputOnBlur = this.onBlur_.bind(this);
  this.boundElementMouseUp = this.onMouseUp_.bind(this);
  this.inputElement_.addEventListener(goog.events.EventType.CHANGE, this.boundInputOnChange);
  this.inputElement_.addEventListener(goog.events.EventType.FOCUS, this.boundInputOnFocus);
  this.inputElement_.addEventListener(goog.events.EventType.BLUR, this.boundInputOnBlur);
  this.element_.addEventListener(goog.events.EventType.MOUSEUP, this.boundElementMouseUp);

  this.updateClasses_();
  this.element_.classList.add(MaterialCheckboxCssClasses_.IS_UPGRADED);
};

/**
 * Handle change of state.
 *
 * @param {Event} event The event that fired.
 * @private
 */
material.MaterialCheckbox.prototype.onChange_ = function(event) {
  this.updateClasses_();
};

/**
 * Handle focus of element.
 *
 * @param {Event} event The event that fired.
 * @private
 */
material.MaterialCheckbox.prototype.onFocus_ = function(event) {
  this.element_.classList.add(this.CssClasses_.IS_FOCUSED);
};

/**
 * Handle lost focus of element.
 *
 * @param {Event} event The event that fired.
 * @private
 */
material.MaterialCheckbox.prototype.onBlur_ = function(event) {
  this.element_.classList.remove(this.CssClasses_.IS_FOCUSED);
};

/**
 * Handle mouseup.
 *
 * @param {Event} event The event that fired.
 * @private
 */
material.MaterialCheckbox.prototype.onMouseUp_ = function(event) {
  this.blur_();
};

/**
 * Handle class updates.
 *
 * @private
 */
material.MaterialCheckbox.prototype.updateClasses_ = function() {
  this.checkDisabled();
  this.checkToggleState();
};

/**
 * Add blur.
 *
 * @private
 */
material.MaterialCheckbox.prototype.blur_ = function() {
  // TODO: figure out why there's a focus event being fired after our blur,
  // so that we can avoid this hack.
  window.setTimeout(function() {
    this.inputElement_.blur();
  }.bind(this), /** @type {number} */ (TINY_TIMEOUT));
};

// Public methods.

/**
 * Indicate whether the checkbox is currently checked.
 *
 * @public
 * @return {boolean}
 */
material.MaterialCheckbox.prototype.isChecked = function() {
  return !!this.inputElement_.checked;
};

/**
 * Check the inputs toggle state and update display.
 *
 * @public
 */
material.MaterialCheckbox.prototype.checkToggleState = function() {
  if (this.inputElement_.checked) {
    this.element_.classList.add(this.CssClasses_.IS_CHECKED);
  } else {
    this.element_.classList.remove(this.CssClasses_.IS_CHECKED);
  }
};

/**
 * Check the inputs disabled state and update display.
 *
 * @public
 */
material.MaterialCheckbox.prototype.checkDisabled = function() {
  if (this.inputElement_.disabled) {
    this.element_.classList.add(this.CssClasses_.IS_DISABLED);
  } else {
    this.element_.classList.remove(this.CssClasses_.IS_DISABLED);
  }
};

/**
 * Disable checkbox.
 *
 * @public
 */
material.MaterialCheckbox.prototype.disable = function() {
  this.inputElement_.disabled = true;
  this.updateClasses_();
};

/**
 * Enable checkbox.
 *
 * @public
 */
material.MaterialCheckbox.prototype.enable = function() {
  this.inputElement_.disabled = false;
  this.updateClasses_();
};

/**
 * Check checkbox.
 *
 * @public
 */
material.MaterialCheckbox.prototype.check = function() {
  this.inputElement_.checked = true;
  this.updateClasses_();
};

/**
 * Uncheck checkbox.
 *
 * @public
 */
material.MaterialCheckbox.prototype.uncheck = function() {
  this.inputElement_.checked = false;
  this.updateClasses_();
};
