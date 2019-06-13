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

goog.require('componentHandler.register');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');

goog.provide('material.MaterialIconToggle');


/**
 * Timeout value.
 *
 * @const {number}
 * @private
 */
const TINY_TIMEOUT_ = 0.001;


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {!string}
 * @private
 */
const CssClasses_ = {
  INPUT: goog.getCssName('mdl-icon-toggle__input'),
  JS_RIPPLE_EFFECT: goog.getCssName('mdl-js-ripple-effect'),
  RIPPLE_IGNORE_EVENTS: goog.getCssName('mdl-js-ripple-effect--ignore-events'),
  RIPPLE_CONTAINER: goog.getCssName('mdl-icon-toggle__ripple-container'),
  RIPPLE_CENTER: goog.getCssName('mdl-ripple--center'),
  RIPPLE: goog.getCssName('mdl-ripple'),
  IS_FOCUSED: goog.getCssName('is-focused'),
  IS_DISABLED: goog.getCssName('is-disabled'),
  IS_CHECKED: goog.getCssName('is-checked')
};


/**
 * Class constructor for icon toggle MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialIconToggle = function MaterialIconToggle(element) {
  const spanName = goog.dom.TagName.SPAN.toString();

  /**
   * Main element.
   *
   * @const
   * @type {!HTMLElement}
   * @private
   */
  this.element_ = element;

  // Initialize instance.
  /**
   * Input element.
   *
   * @const
   * @type {!HTMLInputElement}
   * @private
   */
  this.inputElement_ = /** @type {!HTMLInputElement} */ (
    this.element_.querySelector('.' + CssClasses_.INPUT));

  /**
   * Ripple element.
   *
   * @const
   * @type {!HTMLSpanElement}
   * @private
   */
  this.rippleContainerElement_ = /** @type {!HTMLSpanElement} */ (document.createElement(spanName));

  if (this.element_.classList.contains(CssClasses_.JS_RIPPLE_EFFECT)) {
    this.element_.classList.add(CssClasses_.RIPPLE_IGNORE_EVENTS);
    this.rippleContainerElement_.classList.add(CssClasses_.RIPPLE_CONTAINER);
    this.rippleContainerElement_.classList.add(CssClasses_.JS_RIPPLE_EFFECT);
    this.rippleContainerElement_.classList.add(CssClasses_.RIPPLE_CENTER);
    this.boundRippleMouseUp = this.onMouseUp_.bind(this);
    this.rippleContainerElement_.addEventListener(goog.events.EventType.MOUSEUP, this.boundRippleMouseUp);

    const ripple = document.createElement(spanName);
    ripple.classList.add(CssClasses_.RIPPLE);

    this.rippleContainerElement_.appendChild(ripple);
    this.element_.appendChild(this.rippleContainerElement_);
  }

  this.boundInputOnChange_ = this.onChange_.bind(this);
  this.boundInputOnFocus_ = this.onFocus_.bind(this);
  this.boundInputOnBlur_ = this.onBlur_.bind(this);
  this.boundElementOnMouseUp_ = this.onMouseUp_.bind(this);

  this.inputElement_.addEventListener(goog.events.EventType.CHANGE, this.boundInputOnChange_);
  this.inputElement_.addEventListener(goog.events.EventType.FOCUS, this.boundInputOnFocus_);
  this.inputElement_.addEventListener(goog.events.EventType.BLUR, this.boundInputOnBlur_);
  this.element_.addEventListener(goog.events.EventType.MOUSEUP, this.boundElementOnMouseUp_);

  this.updateClasses_();
  this.element_.classList.add(goog.getCssName('is-upgraded'));
};


/**
 * Handle change of state.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialIconToggle.prototype.onChange_ = function(event) {
  this.updateClasses_();
};


/**
 * Handle focus of element.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialIconToggle.prototype.onFocus_ = function(event) {
  this.element_.classList.add(CssClasses_.IS_FOCUSED);
};


/**
 * Handle lost focus of element.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialIconToggle.prototype.onBlur_ = function(event) {
  this.element_.classList.remove(CssClasses_.IS_FOCUSED);
};

/**
 * Handle mouseup.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialIconToggle.prototype.onMouseUp_ = function(event) {
  this.blur_();
};

/**
 * Handle class updates.
 *
 * @private
 */
material.MaterialIconToggle.prototype.updateClasses_ = function() {
  this.checkDisabled();
  this.checkToggleState();
};

/**
 * Add blur.
 *
 * @private
 */
material.MaterialIconToggle.prototype.blur_ = function() {
  // TODO: figure out why there's a focus event being fired after our blur,
  // so that we can avoid this hack.
  window.setTimeout(function() {
    this.inputElement_.blur();
  }.bind(this), /** @type {number} */ (TINY_TIMEOUT_));
};

// Public methods.

/**
 * Check the inputs toggle state and update display.
 *
 * @public
 */
material.MaterialIconToggle.prototype.checkToggleState = function() {
  if (this.inputElement_.checked) {
    this.element_.classList.add(CssClasses_.IS_CHECKED);
  } else {
    this.element_.classList.remove(CssClasses_.IS_CHECKED);
  }
};


/**
 * Check the inputs disabled state and update display.
 *
 * @public
 */
material.MaterialIconToggle.prototype.checkDisabled = function() {
  if (this.inputElement_.disabled) {
    this.element_.classList.add(CssClasses_.IS_DISABLED);
  } else {
    this.element_.classList.remove(CssClasses_.IS_DISABLED);
  }
};


/**
 * Disable icon toggle.
 *
 * @public
 */
material.MaterialIconToggle.prototype.disable = function() {
  this.inputElement_.disabled = true;
  this.updateClasses_();
};


/**
 * Enable icon toggle.
 *
 * @public
 */
material.MaterialIconToggle.prototype.enable = function() {
  this.inputElement_.disabled = false;
  this.updateClasses_();
};


/**
 * Check icon toggle.
 *
 * @public
 */
material.MaterialIconToggle.prototype.check = function() {
  this.inputElement_.checked = true;
  this.updateClasses_();
};


/**
 * Uncheck icon toggle.
 *
 * @public
 */
material.MaterialIconToggle.prototype.uncheck = function() {
  this.inputElement_.checked = false;
  this.updateClasses_();
};


// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
  constructor: material.MaterialIconToggle,
  classAsString: 'MaterialIconToggle',
  cssClass: goog.getCssName('mdl-js-icon-toggle'),
  widget: true
});
