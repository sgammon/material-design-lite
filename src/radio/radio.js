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

goog.provide('material.MaterialRadio');

goog.require('componentHandler.register');
goog.require('componentHandler.xid');
goog.require('goog.events.EventType');


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialRadioCssClasses_ = {
  IS_FOCUSED: goog.getCssName('is-focused'),
  IS_DISABLED: goog.getCssName('is-disabled'),
  IS_CHECKED: goog.getCssName('is-checked'),
  IS_UPGRADED: goog.getCssName('is-upgraded'),
  JS_RADIO: goog.getCssName('mdl-js-radio'),
  RADIO_BTN: goog.getCssName('mdl-radio__button'),
  RADIO_OUTER_CIRCLE: goog.getCssName('mdl-radio__outer-circle'),
  RADIO_INNER_CIRCLE: goog.getCssName('mdl-radio__inner-circle'),
  RIPPLE_EFFECT: goog.getCssName('mdl-js-ripple-effect'),
  RIPPLE_IGNORE_EVENTS: goog.getCssName('mdl-js-ripple-effect--ignore-events'),
  RIPPLE_CONTAINER: goog.getCssName('mdl-radio__ripple-container'),
  RIPPLE_CENTER: goog.getCssName('mdl-ripple--center'),
  RIPPLE: goog.getCssName('mdl-ripple')
};


/**
 * Class constructor for Radio MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialRadio = function MaterialRadio(element) {
  /**
   * Root element for the radio widget.
   *
   * @const
   * @type {!HTMLElement}
   * @private
   */
  this.element_ = element;

  /**
   * Button element for the radio.
   *
   * @const
   * @type {!HTMLInputElement}
   * @private
   */
  this.btnElement_ = /** @type {!HTMLInputElement} */ (
    this.element_.querySelector('.' + MaterialRadioCssClasses_.RADIO_BTN));

  /**
   * @private
   * @const */
  this.boundChangeHandler_ = this.onChange_.bind(this);
  /**
   * @private
   * @const */
  this.boundFocusHandler_ = this.onFocus_.bind(this);
  /**
   * @private
   * @const */
  this.boundBlurHandler_ = this.onBlur_.bind(this);
  /**
   * @private
   * @const */
  this.boundMouseUpHandler_ = this.onMouseup_.bind(this);

  let outerCircle;
  const spanOuter = this.element_.getElementsByClassName(MaterialRadioCssClasses_.RADIO_OUTER_CIRCLE);
  if (spanOuter !== null && spanOuter.length > 0) {
    outerCircle = spanOuter.item(0);
  } else {
    outerCircle = document.createElement('span');
    outerCircle.classList.add(MaterialRadioCssClasses_.RADIO_OUTER_CIRCLE);
    this.element_.appendChild(outerCircle);
  }

  let innerCircle;
  const spanInner = this.element_.getElementsByClassName(MaterialRadioCssClasses_.RADIO_INNER_CIRCLE);
  if (spanInner !== null && spanInner.length > 0) {
    innerCircle = spanInner.item(0);
  } else {
    innerCircle = document.createElement('span');
    innerCircle.classList.add(MaterialRadioCssClasses_.RADIO_INNER_CIRCLE);
    this.element_.appendChild(innerCircle);
  }

  let rippleContainer;
  if (this.element_.classList.contains(
    MaterialRadioCssClasses_.RIPPLE_EFFECT)) {
    if (!this.element_.classList.contains(MaterialRadioCssClasses_.RIPPLE_IGNORE_EVENTS)) {
      this.element_.classList.add(
        MaterialRadioCssClasses_.RIPPLE_IGNORE_EVENTS);
    }
    let didCreateRipple = false;
    const spanRipple = this.element_.getElementsByClassName(
      MaterialRadioCssClasses_.RIPPLE_CONTAINER);
    if (spanRipple !== null && spanRipple.length > 0) {
      rippleContainer = spanRipple.item(0);
    } else {
      didCreateRipple = true;
      rippleContainer = document.createElement('span');
    }
    if (!rippleContainer.classList.contains(MaterialRadioCssClasses_.RIPPLE_CONTAINER))
      rippleContainer.classList.add(MaterialRadioCssClasses_.RIPPLE_CONTAINER);
    if (!rippleContainer.classList.contains(MaterialRadioCssClasses_.RIPPLE_EFFECT))
      rippleContainer.classList.add(MaterialRadioCssClasses_.RIPPLE_EFFECT);
    if (!rippleContainer.classList.contains(MaterialRadioCssClasses_.RIPPLE_CENTER))
      rippleContainer.classList.add(MaterialRadioCssClasses_.RIPPLE_CENTER);

    rippleContainer.addEventListener(goog.events.EventType.MOUSEUP, this.boundMouseUpHandler_);

    let ripple;
    const rippleInnerSpan = rippleContainer
        .getElementsByClassName(MaterialRadioCssClasses_.RIPPLE);
    if (rippleInnerSpan !== null && rippleInnerSpan.length > 0) {
      ripple = rippleInnerSpan.item(0);
    } else {
      ripple = document.createElement('span');
    }
    if (!ripple.classList.contains(MaterialRadioCssClasses_.RIPPLE))
      ripple.classList.add(MaterialRadioCssClasses_.RIPPLE);

    if (didCreateRipple) {
      rippleContainer.appendChild(ripple);
      this.element_.appendChild(rippleContainer);
    }
  }

  this.btnElement_.addEventListener(goog.events.EventType.CHANGE, this.boundChangeHandler_);
  this.btnElement_.addEventListener(goog.events.EventType.FOCUS, this.boundFocusHandler_);
  this.btnElement_.addEventListener(goog.events.EventType.BLUR, this.boundBlurHandler_);
  this.element_.addEventListener(goog.events.EventType.MOUSEUP, this.boundMouseUpHandler_);

  this.updateClasses_();
  this.element_.classList.add(MaterialRadioCssClasses_.IS_UPGRADED);
};

/**
 * Handle change of state.
 *
 * @private
 * @param {?Event} event The event that fired.
 * @suppress {reportUnknownTypes}
 */
material.MaterialRadio.prototype.onChange_ = function(event) {
  // Since other radio buttons don't get change events, we need to look for
  // them to update their classes.
  const radios = document.getElementsByClassName(MaterialRadioCssClasses_.JS_RADIO);
  for (let i = 0; i < radios.length; i++) {
    const button = radios[i].querySelector('.' + MaterialRadioCssClasses_.RADIO_BTN);
    // Different name == different group, so no point updating those.
    if (button.getAttribute('name') === this.btnElement_.getAttribute('name')) {
      if (typeof radios[i]['MaterialRadio'] !== 'undefined') {
        radios[i]['MaterialRadio'].updateClasses_();
      }
    }
  }
};

/**
 * Handle focus.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialRadio.prototype.onFocus_ = function(event) {
  this.element_.classList.add(MaterialRadioCssClasses_.IS_FOCUSED);
};

/**
 * Handle lost focus.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialRadio.prototype.onBlur_ = function(event) {
  this.element_.classList.remove(MaterialRadioCssClasses_.IS_FOCUSED);
};

/**
 * Handle mouseup.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialRadio.prototype.onMouseup_ = function(event) {
  this.blur_();
};

/**
 * Update classes.
 *
 * @private
 */
material.MaterialRadio.prototype.updateClasses_ = function() {
  this.checkDisabled();
  this.checkToggleState();
};

/**
 * Add blur.
 *
 * @private
 */
material.MaterialRadio.prototype.blur_ = function() {
  this.btnElement_.blur();
};

// Public methods.

/**
 * Check the components disabled state.
 *
 * @public
 */
material.MaterialRadio.prototype.checkDisabled = function() {
  if (this.btnElement_.disabled) {
    this.element_.classList.add(MaterialRadioCssClasses_.IS_DISABLED);
  } else {
    this.element_.classList.remove(MaterialRadioCssClasses_.IS_DISABLED);
  }
};

/**
 * Check the components toggled state.
 *
 * @public
 */
material.MaterialRadio.prototype.checkToggleState = function() {
  if (this.btnElement_.checked) {
    this.element_.classList.add(MaterialRadioCssClasses_.IS_CHECKED);
  } else {
    this.element_.classList.remove(MaterialRadioCssClasses_.IS_CHECKED);
  }
};

/**
 * Disable radio.
 *
 * @public
 */
material.MaterialRadio.prototype.disable = function() {
  this.btnElement_.disabled = true;
  this.updateClasses_();
};

/**
 * Enable radio.
 *
 * @public
 */
material.MaterialRadio.prototype.enable = function() {
  this.btnElement_.disabled = false;
  this.updateClasses_();
};

/**
 * Check radio.
 *
 * @public
 */
material.MaterialRadio.prototype.check = function() {
  this.btnElement_.checked = true;
  this.onChange_(null);
};

/**
 * Uncheck radio.
 *
 * @public
 */
material.MaterialRadio.prototype.uncheck = function() {
  this.btnElement_.checked = false;
  this.onChange_(null);
};


// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
  constructor: material.MaterialRadio,
  classAsString: componentHandler.xid('MaterialRadio'),
  cssClass: goog.getCssName('mdl-js-radio'),
  widget: true
});
