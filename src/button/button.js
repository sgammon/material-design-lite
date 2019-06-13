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
goog.require('goog.events.EventType');
goog.require('goog.dom.TagName');
goog.require('material.MaterialRipple');

goog.provide('material.MaterialButton');


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialButtonClasses_ = {
  RIPPLE_EFFECT: goog.getCssName('mdl-js-ripple-effect'),
  RIPPLE_CONTAINER: goog.getCssName('mdl-button__ripple-container'),
  RIPPLE: goog.getCssName('mdl-ripple'),
  JS_BUTTON: goog.getCssName('mdl-js-button')
};

/**
 * Class constructor for Button MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialButton = function MaterialButton(element) {
  /**
   * Element that will be upgraded.
   *
   * @const
   * @private
   * @type {!HTMLElement}
   */
  this.element_ = element;

  // if it's annotated with a ripple-effect class, add the container
  // to facilitate the ripple, and instantiate the JavaScript object
  // that manages the ripple.
  if (this.element_.classList.contains(MaterialButtonClasses_.RIPPLE_EFFECT)) {
    const rippleContainer = /** @type {!HTMLSpanElement} */ (
        document.createElement(goog.dom.TagName.SPAN.toString()));
    const rippleElement = /** @type {!HTMLSpanElement} */ (
      document.createElement(goog.dom.TagName.SPAN.toString()));

    rippleContainer.classList.add(MaterialButtonClasses_.RIPPLE_CONTAINER);
    rippleElement.classList.add(MaterialButtonClasses_.RIPPLE);
    rippleContainer.appendChild(rippleElement);

    this.boundRippleBlurHandler = this.blurHandler_.bind(this);
    rippleElement.addEventListener(goog.events.EventType.MOUSEUP, this.boundRippleBlurHandler);
    this.element_.appendChild(rippleContainer);

    /**
     * Ripple effect inner element.
     *
     * @const
     * @private
     * @type {!HTMLSpanElement}
     */
    this.rippleElement_ = rippleElement;

    /**
     * Ripple effect container element.
     *
     * @const
     * @private
     * @type {!HTMLSpanElement}
     */
    this.rippleContainer_ = rippleContainer;

    /**
     * References the JavaScript ripple animation code, which is attached to the ripple
     * container and applies the effect via the inner element.
     *
     * @const
     * @private
     * @type {!material.MaterialRipple}
     */
    this.rippleEffect_ = new material.MaterialRipple(rippleContainer);
  }
  this.boundButtonBlurHandler = this.blurHandler_.bind(this);
  this.element_.addEventListener(goog.events.EventType.MOUSEUP, this.boundButtonBlurHandler);
  this.element_.addEventListener(goog.events.EventType.MOUSELEAVE, this.boundButtonBlurHandler);
};

/**
 * Handle blur of element.
 *
 * @param {!Event} event The event that fired.
 * @private
 */
material.MaterialButton.prototype.blurHandler_ = function(event) {
  if (event) {
    this.element_.blur();
  }
};

// Public methods.

/**
 * Disable button.
 *
 * @public
 */
material.MaterialButton.prototype.disable = function() {
  this.element_.setAttribute('disabled', 'disabled');
};

/**
 * Enable button.
 *
 * @public
 */
material.MaterialButton.prototype.enable = function() {
  this.element_.removeAttribute('disabled');
};


componentHandler.register({
  constructor: material.MaterialButton,
  classAsString: 'MaterialButton',
  cssClass: goog.getCssName('mdl-js-button'),
  widget: true
});
