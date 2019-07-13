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

goog.provide('material.MaterialSlider');

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
const MaterialSliderCssClasses_ = {
  IE_CONTAINER: goog.getCssName('mdl-slider__ie-container'),
  SLIDER_CONTAINER: goog.getCssName('mdl-slider__container'),
  BACKGROUND_FLEX: goog.getCssName('mdl-slider__background-flex'),
  BACKGROUND_LOWER: goog.getCssName('mdl-slider__background-lower'),
  BACKGROUND_UPPER: goog.getCssName('mdl-slider__background-upper'),
  IS_LOWEST_VALUE: goog.getCssName('is-lowest-value'),
  IS_UPGRADED: goog.getCssName('is-upgraded')
};


/**
 * Class constructor for Slider MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialSlider = function MaterialSlider(element) {
  /**
   * Root element for this slider.
   *
   * @const
   * @type {!HTMLElement}
   * @private
   */
  this.element_ = element;

  // Browser feature detection.
  /**
   * Whether we are running on IE.
   *
   * @type {boolean}
   * @private
   */
  this.isIE_ = window.navigator.msPointerEnabled || false;

  if (this.isIE_) {
    // Since we need to specify a very large height in IE due to
    // implementation limitations, we add a parent here that trims it down to
    // a reasonable size.
    const containerIE = document.createElement('div');
    containerIE.classList.add(MaterialSliderCssClasses_.IE_CONTAINER);
    this.element_.parentElement.insertBefore(containerIE, this.element_);
    this.element_.parentElement.removeChild(this.element_);
    containerIE.appendChild(this.element_);
  } else {
    // For non-IE browsers, we need a div structure that sits behind the
    // slider and allows us to style the left and right sides of it with
    // different colors.
    const container = document.createElement('div');
    container.classList.add(MaterialSliderCssClasses_.SLIDER_CONTAINER);
    this.element_.parentElement.insertBefore(container, this.element_);
    this.element_.parentElement.removeChild(this.element_);
    container.appendChild(this.element_);
    const backgroundFlex = document.createElement('div');
    backgroundFlex.classList.add(MaterialSliderCssClasses_.BACKGROUND_FLEX);
    container.appendChild(backgroundFlex);

    /** @private */
    this.backgroundLower_ = document.createElement('div');
    this.backgroundLower_.classList.add(MaterialSliderCssClasses_.BACKGROUND_LOWER);
    backgroundFlex.appendChild(this.backgroundLower_);

    /** @private */
    this.backgroundUpper_ = document.createElement('div');
    this.backgroundUpper_.classList.add(MaterialSliderCssClasses_.BACKGROUND_UPPER);
    backgroundFlex.appendChild(this.backgroundUpper_);
  }

  /** @private */
  this.boundInputHandler_ = this.onInput_.bind(this);
  /** @private */
  this.boundChangeHandler_ = this.onChange_.bind(this);
  /** @private */
  this.boundContainerMouseDownHandler_ = this.onContainerMouseDown_.bind(this);
  this.element_.addEventListener(goog.events.EventType.INPUT, this.boundInputHandler_);
  this.element_.addEventListener(goog.events.EventType.CHANGE, this.boundChangeHandler_);
  this.element_.parentElement.addEventListener(goog.events.EventType.MOUSEDOWN,
    this.boundContainerMouseDownHandler_);

  this.updateValueStyles_();
  this.element_.classList.add(MaterialSliderCssClasses_.IS_UPGRADED);
};

/**
 * Handle input on element.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialSlider.prototype.onInput_ = function(event) {
  this.updateValueStyles_();
};

/**
 * Handle change on element.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialSlider.prototype.onChange_ = function(event) {
  this.updateValueStyles_();
};

/**
 * Handle mousedown on container element.
 * This handler is purpose is to not require the use to click
 * exactly on the 2px slider element, as FireFox seems to be very
 * strict about this.
 *
 * @param {!Event} event The event that fired.
 * @private
 * @suppress {missingProperties}
 */
material.MaterialSlider.prototype.onContainerMouseDown_ = function(event) {
  // If this click is not on the parent element (but rather some child)
  // ignore. It may still bubble up.
  if (event.target !== this.element_.parentElement) {
    return;
  }

  // Discard the original event and create a new event that
  // is on the slider element.
  event.preventDefault();
  const newEvent = new MouseEvent(goog.events.EventType.MOUSEDOWN, {
    target: event.target,
    buttons: event.buttons,
    clientX: event.clientX,
    clientY: this.element_.getBoundingClientRect().y
  });
  this.element_.dispatchEvent(newEvent);
};

/**
 * Handle updating of values.
 *
 * @private
 */
material.MaterialSlider.prototype.updateValueStyles_ = function() {
  // Calculate and apply percentages to div structure behind slider.
  const fraction = (this.element_.value - this.element_.min) /
                   (this.element_.max - this.element_.min);

  if (fraction === 0) {
    this.element_.classList.add(this.CssClasses_.IS_LOWEST_VALUE);
  } else {
    this.element_.classList.remove(this.CssClasses_.IS_LOWEST_VALUE);
  }

  if (!this.isIE_) {
    this.backgroundLower_.style.flex = fraction;
    this.backgroundLower_.style.webkitFlex = fraction;
    this.backgroundUpper_.style.flex = 1 - fraction;
    this.backgroundUpper_.style.webkitFlex = 1 - fraction;
  }
};

// Public methods.

/**
 * Disable slider.
 *
 * @public
 */
material.MaterialSlider.prototype.disable = function() {
  this.element_.disabled = true;
};

/**
 * Enable slider.
 *
 * @public
 */
material.MaterialSlider.prototype.enable = function() {
  this.element_.disabled = false;
};

/**
 * Update slider value.
 *
 * @param {number} value The value to which to set the control (optional).
 * @public
 */
material.MaterialSlider.prototype.change = function(value) {
  if (typeof value !== 'undefined') {
    this.element_.value = value;
  }
  this.updateValueStyles_();
};


// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
  constructor: material.MaterialSlider,
  classAsString: componentHandler.xid('MaterialSlider'),
  cssClass: goog.getCssName('mdl-js-slider'),
  widget: true
});
