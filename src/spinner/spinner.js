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
goog.require('goog.dom.TagName');

goog.provide('material.MaterialSpinner');


/**
 * Spinner layer count.
 *
 * @const
 * @private
 * @type {number}
 */
const MDL_SPINNER_LAYER_COUNT = 4;


/**
 * Class constructor for Spinner MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @param {!HTMLElement} element The element that will be upgraded.
 * @constructor
 */
material.MaterialSpinner = function MaterialSpinner(element) {
  this.element_ = element;

  for (let i = 1; i <= MDL_SPINNER_LAYER_COUNT; i++) {
    this.createLayer(i);
  }
  this.element_.classList.add(goog.getCssName('is-upgraded'));
};

/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @enum {string}
 * @private
 */
const MaterialSpinnerCssClasses_ = {
  MDL_SPINNER_LAYER: goog.getCssName('mdl-spinner__layer'),
  MDL_SPINNER_CIRCLE_CLIPPER: goog.getCssName('mdl-spinner__circle-clipper'),
  MDL_SPINNER_CIRCLE: goog.getCssName('mdl-spinner__circle'),
  MDL_SPINNER_GAP_PATCH: goog.getCssName('mdl-spinner__gap-patch'),
  MDL_SPINNER_LEFT: goog.getCssName('mdl-spinner__left'),
  MDL_SPINNER_RIGHT: goog.getCssName('mdl-spinner__right')
};

/**
 * Auxiliary method to create a spinner layer.
 *
 * @param {number} index Index of the layer to be created.
 * @public
 */
material.MaterialSpinner.prototype.createLayer = function(index) {
  const layer = document.createElement(goog.dom.TagName.DIV.toString());
  layer.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_LAYER);
  layer.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_LAYER + '-' + index);

  const leftClipper = document.createElement(goog.dom.TagName.DIV.toString());
  leftClipper.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
  leftClipper.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_LEFT);

  const gapPatch = document.createElement(goog.dom.TagName.DIV.toString());
  gapPatch.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_GAP_PATCH);

  const rightClipper = document.createElement(goog.dom.TagName.DIV.toString());
  rightClipper.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_CIRCLE_CLIPPER);
  rightClipper.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_RIGHT);

  const circle1 = document.createElement(goog.dom.TagName.DIV.toString());
  circle1.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_CIRCLE);
  leftClipper.appendChild(circle1);

  const circle2 = document.createElement(goog.dom.TagName.DIV.toString());
  circle2.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_CIRCLE);
  gapPatch.appendChild(circle2);

  const circle3 = document.createElement(goog.dom.TagName.DIV.toString());
  circle3.classList.add(MaterialSpinnerCssClasses_.MDL_SPINNER_CIRCLE);
  rightClipper.appendChild(circle3);

  layer.appendChild(leftClipper);
  layer.appendChild(gapPatch);
  layer.appendChild(rightClipper);

  this.element_.appendChild(layer);
};

/**
 * Stops the spinner animation.
 * Public method for users who need to stop the spinner for any reason.
 *
 * @public
 */
material.MaterialSpinner.prototype.stop = function() {
  this.element_.classList.remove(goog.getCssName('is-active'));
};

/**
 * Starts the spinner animation.
 * Public method for users who need to manually start the spinner for any reason
 * (instead of just adding the 'is-active' class to their markup).
 *
 * @public
 */
material.MaterialSpinner.prototype.start = function() {
  this.element_.classList.add(goog.getCssName('is-active'));
};


componentHandler.register({
  constructor: material.MaterialSnackbar,
  classAsString: 'MaterialSnackbar',
  cssClass: goog.getCssName('mdl-js-snackbar'),
  widget: true
});
