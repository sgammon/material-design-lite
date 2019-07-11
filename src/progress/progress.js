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

goog.provide('material.MaterialProgress');

goog.require('componentHandler.register');
goog.require('goog.dom.TagName');


/**
 * Store strings for class names defined by this component that are used in
 * JavaScript. This allows us to simply change it in one place should we
 * decide to modify at a later date.
 *
 * @const {!string}
 * @private
 */
const INDETERMINATE_CLASS = goog.getCssName('mdl-progress__indeterminate');


/**
 * Class constructor for Progress MDL component.
 * Implements MDL component design pattern defined at:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @constructor
 * @param {!HTMLElement} element The element that will be upgraded.
 */
material.MaterialProgress = function MaterialProgress(element) {
  const divName = goog.dom.TagName.DIV.toString();
  this.element_ = element;

  // Initialize instance.
  let el = document.createElement(divName);
  el.className = [
    goog.getCssName('progressbar'),
    goog.getCssName('bar'),
    goog.getCssName('bar1')].join(' ');
  this.element_.appendChild(el);
  this.progressbar_ = el;

  el = document.createElement(divName);
  el.className = [
    goog.getCssName('bufferbar'),
    goog.getCssName('bar'),
    goog.getCssName('bar2')].join(' ');
  this.element_.appendChild(el);
  this.bufferbar_ = el;

  el = document.createElement(divName);
  el.className = [
    goog.getCssName('auxbar'),
    goog.getCssName('bar'),
    goog.getCssName('bar3')].join(' ');
  this.element_.appendChild(el);
  this.auxbar_ = el;

  this.progressbar_.style.width = '0%';
  this.bufferbar_.style.width = '100%';
  this.auxbar_.style.width = '0%';

  this.element_.classList.add(goog.getCssName('is-upgraded'));
};

/**
 * Set the current progress of the progressbar.
 *
 * @param {number} p Percentage of the progress (0-100)
 * @param {boolean=} opt_force Force the change even in indeterminate mode.
 * @export
 */
material.MaterialProgress.prototype.setProgress = function(p, opt_force) {
  if (!!opt_force && this.element_.classList.contains(INDETERMINATE_CLASS)) {
    return;
  }

  this.progressbar_.style.width = p + '%';
};


/**
 * Set the current progress of the buffer.
 *
 * @param {number} p Percentage of the buffer (0-100)
 * @public
 */
material.MaterialProgress.prototype.setBuffer = function(p) {
  this.bufferbar_.style.width = p + '%';
  this.auxbar_.style.width = (100 - p) + '%';
};


// The component registers itself. It can assume componentHandler is available
// in the global scope.
componentHandler.register({
  constructor: material.MaterialProgress,
  classAsString: 'MaterialProgress',
  cssClass: goog.getCssName('mdl-js-progress'),
  widget: true
});
