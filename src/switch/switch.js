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

goog.provide('material.MaterialSwitch');

goog.require('componentHandler.register');
goog.require('goog.events.EventType');


/**
 * Tiny timeout value.
 *
 * @const
 * @type {number}
 * @private
 */
const SWITCH_TINY_TIMEOUT_ = 0.001;

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialSwitchCssClasses_ = {
  INPUT: goog.getCssName('mdl-switch__input'),
  TRACK: goog.getCssName('mdl-switch__track'),
  THUMB: goog.getCssName('mdl-switch__thumb'),
  FOCUS_HELPER: goog.getCssName('mdl-switch__focus-helper'),
  RIPPLE_EFFECT: goog.getCssName('mdl-js-ripple-effect'),
  RIPPLE_IGNORE_EVENTS: goog.getCssName('mdl-js-ripple-effect--ignore-events'),
  RIPPLE_CONTAINER: goog.getCssName('mdl-switch__ripple-container'),
  RIPPLE_CENTER: goog.getCssName('mdl-ripple--center'),
  RIPPLE: goog.getCssName('mdl-ripple'),
  IS_FOCUSED: goog.getCssName('is-focused'),
  IS_DISABLED: goog.getCssName('is-disabled'),
  IS_CHECKED: goog.getCssName('is-checked')
};

/**
 * Class constructor for Checkbox MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @public
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialSwitch = function MaterialSwitch(element) {
  this.element_ = element;

  // Initialize instance.
  /**
   * Input element.
   *
   * @const
   * @type {!HTMLInputElement}
   * @private
   */
  this.inputElement_ = /** @type {!HTMLInputElement} */ (this.element_.querySelector('.' +
    MaterialSwitchCssClasses_.INPUT));

  const track = document.createElement('div');
  track.classList.add(MaterialSwitchCssClasses_.TRACK);

  const thumb = document.createElement('div');
  thumb.classList.add(MaterialSwitchCssClasses_.THUMB);

  const focusHelper = document.createElement('span');
  focusHelper.classList.add(MaterialSwitchCssClasses_.FOCUS_HELPER);

  thumb.appendChild(focusHelper);

  this.element_.appendChild(track);
  this.element_.appendChild(thumb);

  /**
   * Bound copy of the moust-up handler.
   *
   * @const
   * @private
   */
  this.boundMouseUpHandler_ = this.onMouseUp_.bind(this);

  /**
   * Ripple container element.
   *
   * @const
   * @type {!HTMLSpanElement}
   * @private
   */
  this.rippleContainerElement_ = /** @type {!HTMLSpanElement} */ (
    document.createElement('span'));

  if (this.element_.classList.contains(
    MaterialSwitchCssClasses_.RIPPLE_EFFECT)) {
    this.element_.classList.add(
      MaterialSwitchCssClasses_.RIPPLE_IGNORE_EVENTS);
    this.rippleContainerElement_.classList.add(
      MaterialSwitchCssClasses_.RIPPLE_CONTAINER);
    this.rippleContainerElement_.classList.add(MaterialSwitchCssClasses_.RIPPLE_EFFECT);
    this.rippleContainerElement_.classList.add(MaterialSwitchCssClasses_.RIPPLE_CENTER);
    this.rippleContainerElement_.addEventListener(goog.events.EventType.MOUSEUP, this.boundMouseUpHandler_);

    const ripple = document.createElement('span');
    ripple.classList.add(MaterialSwitchCssClasses_.RIPPLE);

    this.rippleContainerElement_.appendChild(ripple);
    this.element_.appendChild(this.rippleContainerElement_);
  }

  /**
   * @const
   * @private
   */
  this.boundChangeHandler_ = this.onChange_.bind(this);

  /**
   * @const
   * @private
   */
  this.boundFocusHandler_ = this.onFocus_.bind(this);

  /**
   * @const
   * @private
   */
  this.boundBlurHandler_ = this.onBlur_.bind(this);

  this.inputElement_.addEventListener(goog.events.EventType.CHANGE, this.boundChangeHandler_);
  this.inputElement_.addEventListener(goog.events.EventType.FOCUS, this.boundFocusHandler_);
  this.inputElement_.addEventListener(goog.events.EventType.BLUR, this.boundBlurHandler_);
  this.element_.addEventListener(goog.events.EventType.MOUSEUP, this.boundMouseUpHandler_);

  this.updateClasses_();
  this.element_.classList.add(goog.getCssName('is-upgraded'));
};

/**
 * Handle change of state.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialSwitch.prototype.onChange_ = function(event) {
  this.updateClasses_();
};

/**
 * Handle focus of element.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialSwitch.prototype.onFocus_ = function(event) {
  this.element_.classList.add(MaterialSwitchCssClasses_.IS_FOCUSED);
};

/**
 * Handle lost focus of element.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialSwitch.prototype.onBlur_ = function(event) {
  this.element_.classList.remove(MaterialSwitchCssClasses_.IS_FOCUSED);
};

/**
 * Handle mouseup.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialSwitch.prototype.onMouseUp_ = function(event) {
  this.blur_();
};

/**
 * Handle class updates.
 *
 * @private
 */
material.MaterialSwitch.prototype.updateClasses_ = function() {
  this.checkDisabled();
  this.checkToggleState();
};

/**
 * Add blur.
 *
 * @private
 */
material.MaterialSwitch.prototype.blur_ = function() {
  // TODO: figure out why there's a focus event being fired after our blur,
  // so that we can avoid this hack.
  window.setTimeout(function() {
    this.inputElement_.blur();
  }.bind(this), /** @type {number} */ (SWITCH_TINY_TIMEOUT_));
};

// Public methods.

/**
 * Check the components disabled state.
 *
 * @public
 */
material.MaterialSwitch.prototype.checkDisabled = function() {
  if (this.inputElement_.disabled) {
    this.element_.classList.add(MaterialSwitchCssClasses_.IS_DISABLED);
  } else {
    this.element_.classList.remove(MaterialSwitchCssClasses_.IS_DISABLED);
  }
};

/**
 * Check the components toggled state.
 *
 * @public
 */
material.MaterialSwitch.prototype.checkToggleState = function() {
  if (this.inputElement_.checked) {
    this.element_.classList.add(MaterialSwitchCssClasses_.IS_CHECKED);
  } else {
    this.element_.classList.remove(MaterialSwitchCssClasses_.IS_CHECKED);
  }
};

/**
 * Disable switch.
 *
 * @public
 */
material.MaterialSwitch.prototype.disable = function() {
  this.inputElement_.disabled = true;
  this.updateClasses_();
};

/**
 * Enable switch.
 *
 * @public
 */
material.MaterialSwitch.prototype.enable = function() {
  this.inputElement_.disabled = false;
  this.updateClasses_();
};

/**
 * Activate switch.
 *
 * @public
 */
material.MaterialSwitch.prototype.on = function() {
  this.inputElement_.checked = true;
  this.updateClasses_();
};

/**
 * Deactivate switch.
 *
 * @public
 */
material.MaterialSwitch.prototype.off = function() {
  this.inputElement_.checked = false;
  this.updateClasses_();
};

// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
  constructor: material.MaterialSwitch,
  classAsString: 'MaterialSwitch',
  cssClass: goog.getCssName('mdl-js-switch'),
  widget: true
});
