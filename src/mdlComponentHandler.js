
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

/**
 * A component handler interface using the revealing module design pattern.
 * More details on this design pattern here:
 * https://github.com/jasonmayes/mdl-component-design-pattern
 *
 * @author Jason Mayes.
 */
/* exported componentHandler */
goog.provide('componentHandler.downgradeElements');
goog.provide('componentHandler.register');
goog.provide('componentHandler.registerUpgradedCallback');
goog.provide('componentHandler.upgradeAllRegistered');
goog.provide('componentHandler.upgradeDom');
goog.provide('componentHandler.upgradeElement');
goog.provide('componentHandler.upgradeElements');
goog.provide('componentHandler.xid');
goog.provide('util.componentHandler.Component');
goog.provide('util.componentHandler.ComponentConfig');
goog.provide('util.componentHandler.ComponentConfigPublic');
goog.provide('util.componentHandler.bootMdl');


/**
 * @private
 * @type {!Array<!util.componentHandler.ComponentConfig>} */
let registeredComponents_ = [];

/**
 * @private
 * @type {!Array<!util.componentHandler.Component>} */
let createdComponents_ = [];

/**
 * @const
 * @type {string}
 * @private
 */
const componentConfigProperty_ = 'mdlComponentConfigInternal_';

/**
 * Searches registered components for a class we are interested in using.
 * Optionally replaces a match with passed object if specified.
 *
 * @param {string} name The name of a class we want to use.
 * @param {!util.componentHandler.ComponentConfig=} optReplace Optional object to replace match with.
 * @return {!Object|boolean}
 * @private
 */
function findRegisteredClass_(name, optReplace) {
  for (let i = 0; i < registeredComponents_.length; i++) {
    if (registeredComponents_[i].className === name) {
      if (typeof optReplace !== 'undefined') {
        registeredComponents_[i] = optReplace;
      }
      return registeredComponents_[i];
    }
  }
  return false;
}

/**
 * Returns an array of the classNames of the upgraded classes on the element.
 *
 * @param {!Element} element The element to fetch data from.
 * @return {!Array<string>}
 * @private
 */
function getUpgradedListOfElement_(element) {
  const dataUpgraded = element.getAttribute('data-upgraded');
  // Use `['']` as default value to conform the `,name,name...` style.
  return dataUpgraded === null ? [''] : dataUpgraded.split(',');
}

/**
 * Returns true if the given element has already been upgraded for the given
 * class.
 *
 * @param {!Element} element The element we want to check.
 * @param {!string} jsClass The class to check for.
 * @returns {boolean}
 * @private
 */
function isElementUpgraded_(element, jsClass) {
  const upgradedList = getUpgradedListOfElement_(element);
  return upgradedList.indexOf(jsClass) !== -1;
}

/**
 * Create an event object.
 *
 * @param {!string} eventType The type name of the event.
 * @param {boolean} bubbles Whether the event should bubble up the DOM.
 * @param {boolean} cancelable Whether the event can be canceled.
 * @returns {!Event}
 */
function createEvent_(eventType, bubbles, cancelable) {
  if ('CustomEvent' in window && typeof window.CustomEvent === 'function') {
    return new CustomEvent(eventType, {
      bubbles: bubbles,
      cancelable: cancelable
    });
  } else {
    const ev = document.createEvent('Events');
    ev.initEvent(eventType, bubbles, cancelable);
    return ev;
  }
}

/**
 * Searches existing DOM for elements of our component type and upgrades them
 * if they have not already been upgraded.
 *
 * @param {!string=} optJsClass the programmatic name of the element class we
 * need to create a new instance of.
 * @param {!string=} optCssClass the name of the CSS class elements of this
 * type will have.
 */
componentHandler.upgradeDom = function upgradeDomInternal(optJsClass, optCssClass) {
  if (typeof optJsClass === 'undefined' &&
      typeof optCssClass === 'undefined') {
    for (let i = 0; i < registeredComponents_.length; i++) {
      componentHandler.upgradeDom(registeredComponents_[i].className,
          registeredComponents_[i].cssClass);
    }
  } else {
    const jsClass = /** @type {string} */ (optJsClass);
    if (typeof optCssClass === 'undefined') {
      const registeredClass = findRegisteredClass_(jsClass);
      if (registeredClass) {
        optCssClass = registeredClass.cssClass;
      }
    }

    const elements = document.querySelectorAll('.' + optCssClass);
    for (let n = 0; n < elements.length; n++) {
      componentHandler.upgradeElement(elements[n], jsClass);
    }
  }
};

/**
 * Upgrades a specific element rather than all in the DOM.
 *
 * @param {!Element} element The element we wish to upgrade.
 * @param {string=} optJsClass Optional name of the class we want to upgrade
 * the element to.
 * @public
 */
componentHandler.upgradeElement = function upgradeElementInternal(element, optJsClass) {
  // Verify argument type.
  if (!(typeof element === 'object' && element instanceof Element)) {
    throw new Error('Invalid argument provided to upgrade MDL element.');
  }
  // Allow upgrade to be canceled by canceling emitted event.
  const upgradingEv = createEvent_('mdl-componentupgrading', true, true);
  element.dispatchEvent(upgradingEv);
  if (upgradingEv.defaultPrevented) {
    return;
  }

  const upgradedList = getUpgradedListOfElement_(element);
  const classesToUpgrade = [];
  // If jsClass is not provided scan the registered components to find the
  // ones matching the element's CSS classList.
  if (!optJsClass) {
    const classList = element.classList;
    registeredComponents_.forEach(function(component) {
      // Match CSS & Not to be upgraded & Not upgraded.
      if (classList.contains(component.cssClass) &&
          classesToUpgrade.indexOf(component) === -1 &&
          !isElementUpgraded_(element, component.className)) {
        classesToUpgrade.push(component);
      }
    });
  } else if (!isElementUpgraded_(element, optJsClass)) {
    classesToUpgrade.push(findRegisteredClass_(optJsClass));
  }

  // Upgrade the element for each classes.
  for (let i = 0, n = classesToUpgrade.length, registeredClass; i < n; i++) {
    registeredClass = classesToUpgrade[i];
    if (registeredClass) {
      // Mark element as upgraded.
      upgradedList.push(registeredClass.className);
      element.setAttribute('data-upgraded', upgradedList.join(','));
      const instance = new registeredClass.classConstructor(element);
      instance[componentConfigProperty_] = registeredClass;
      createdComponents_.push(instance);
      // Call any callbacks the user has registered with this component type.
      for (let j = 0, m = registeredClass.callbacks.length; j < m; j++) {
        registeredClass.callbacks[j](element);
      }

      if (registeredClass.widget) {
        // Assign per element instance for control over API
        element[registeredClass.className] = instance;
      }
    } else {
      throw new Error(
        'Unable to find a registered component for the given class.');
    }

    const upgradedEv = createEvent_('mdl-componentupgraded', true, false);
    element.dispatchEvent(upgradedEv);
  }
};

/**
 * Upgrades a specific list of elements rather than all in the DOM.
 *
 * @param {!Element|!Array<!Element>|!NodeList|!HTMLCollection} elements
 * The elements we wish to upgrade.
 * @public
 */
componentHandler.upgradeElements = function upgradeElementsInternal(elements) {
  if (!Array.isArray(elements)) {
    if (elements instanceof Element) {
      elements = [elements];
    } else {
      elements = Array.prototype.slice.call(elements);
    }
  }
  for (let i = 0, n = elements.length, element; i < n; i++) {
    element = elements[i];
    if (element instanceof HTMLElement) {
      componentHandler.upgradeElement(element);
      if (element.children.length > 0) {
        componentHandler.upgradeElements(element.children);
      }
    }
  }
};

/**
 * Registers a class for future use and attempts to upgrade existing DOM.
 *
 * @param {!util.componentHandler.ComponentConfigPublic} config
 */
componentHandler.register = function registerInternal(config) {
  // In order to support both Closure-compiled and uncompiled code accessing
  // this method, we need to allow for both the dot and array syntax for
  // property access. You'll therefore see the `foo.bar || foo['bar']`
  // pattern repeated across this method.
  const widgetMissing = (typeof config.widget === 'undefined' &&
      typeof config['widget'] === 'undefined');
  let widget = true;

  if (!widgetMissing) {
    widget = config.widget || config['widget'];
  }

  const newConfig = /** @type {!util.componentHandler.ComponentConfig} */ ({
    classConstructor: config.constructor || config['constructor'],
    className: config.classAsString || config['classAsString'],
    cssClass: config.cssClass || config['cssClass'],
    widget: widget,
    callbacks: []
  });

  registeredComponents_.forEach(function(item) {
    if (item.cssClass === newConfig.cssClass) {
      throw new Error('The provided cssClass has already been registered: ' + item.cssClass);
    }
    if (item.className === newConfig.className) {
      throw new Error('The provided className has already been registered');
    }
  });

  if (config.constructor.prototype
      .hasOwnProperty(componentConfigProperty_)) {
    throw new Error(
        'MDL component classes must not have ' + componentConfigProperty_ +
        ' defined as a property.');
  }

  const found = findRegisteredClass_(config.classAsString, newConfig);

  if (!found) {
    registeredComponents_.push(newConfig);
  }
};

/**
 * Generate an ID for a given component name.
 *
 * @idGenerator {consistent}
 * @param {!string} id Component name, un-transformed.
 * @return {!string} Original, or transformed, ID, depending on compilation
 * settings (in prod mode, it's rewritten).
 */
componentHandler.xid = function(id) {
  return id;
};

/**
 * Allows user to be alerted to any upgrades that are performed for a given
 * component type
 *
 * @param {!string} jsClass The class name of the MDL component we wish
 * to hook into for any upgrades performed.
 * @param {!function(!HTMLElement)} callback The function to call upon an
 * upgrade. This function should expect 1 parameter - the HTMLElement which
 * got upgraded.
 */
componentHandler.registerUpgradedCallback = function registerUpgradedCallbackInternal(jsClass, callback) {
  const regClass = findRegisteredClass_(jsClass);
  if (regClass) {
    regClass.callbacks.push(callback);
  }
};

/**
 * Upgrades all registered components found in the current DOM. This is
 * automatically called on window load.
 */
componentHandler.upgradeAllRegistered = function upgradeAllRegisteredInternal() {
  registeredComponents_.reverse();
  for (let n = 0; n < registeredComponents_.length; n++) {
    componentHandler.upgradeDom(registeredComponents_[n].className);
  }
};

/**
 * Check the component for the downgrade method.
 * Execute if found.
 * Remove component from createdComponents list.
 *
 * @param {?util.componentHandler.Component} component
 */
function deconstructComponentInternal(component) {
  if (component) {
    const componentIndex = createdComponents_.indexOf(component);
    createdComponents_.splice(componentIndex, 1);

    const upgrades = component.element_.getAttribute('data-upgraded').split(',');
    const componentPlace = upgrades.indexOf(component[componentConfigProperty_].classAsString);
    upgrades.splice(componentPlace, 1);
    component.element_.setAttribute('data-upgraded', upgrades.join(','));

    const ev = createEvent_('mdl-componentdowngraded', true, false);
    component.element_.dispatchEvent(ev);
  }
}

/**
 * Downgrade either a given node, an array of nodes, or a NodeList.
 *
 * @param {!Node|!Array<!Node>|!NodeList} nodes
 * @public
 */
componentHandler.downgradeElements = function downgradeNodesInternal(nodes) {
  /**
   * Auxiliary function to downgrade a single node.
   * @param  {!Node} node the node to be downgraded
   */
  const downgradeNode = function(node) {
    createdComponents_.filter(function(item) {
      return item.element_ === node;
    }).forEach(deconstructComponentInternal);
  };
  if (nodes instanceof Array || nodes instanceof NodeList) {
    for (let n = 0; n < nodes.length; n++) {
      downgradeNode(nodes[n]);
    }
  } else if (nodes instanceof Node) {
    downgradeNode(nodes);
  } else {
    throw new Error('Invalid argument provided to downgrade MDL nodes.');
  }
};


/**
 * Describes the type of a registered component type managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   constructor: Function,
 *   classAsString: string,
 *   cssClass: string,
 *   widget: (string|boolean|undefined)
 * }}
 */
util.componentHandler.ComponentConfigPublic;  // jshint ignore:line

/**
 * Describes the type of a registered component type managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   constructor: !Function,
 *   className: string,
 *   cssClass: string,
 *   widget: (string|boolean),
 *   callbacks: !Array<function(!HTMLElement)>
 * }}
 */
util.componentHandler.ComponentConfig;  // jshint ignore:line

/**
 * Created component (i.e., upgraded element) type as managed by
 * componentHandler. Provided for benefit of the Closure compiler.
 *
 * @typedef {{
 *   element_: !HTMLElement,
 *   className: string,
 *   classAsString: string,
 *   cssClass: string,
 *   widget: string
 * }}
 */
util.componentHandler.Component;  // jshint ignore:line


/**
 * Boot MDL by attaching to the `load` event on the window.
 */
util.componentHandler.bootMdl = function() {
  window.addEventListener('load', function() {
    'use strict';

    /**
     * Performs a "Cutting the mustard" test. If the browser supports the features
     * tested, adds a mdl-js class to the <html> element. It then upgrades all MDL
     * components requiring JavaScript.
     */
    if ('classList' in document.createElement('div') &&
      'querySelector' in document &&
      'addEventListener' in window && Array.prototype.forEach) {
      document.documentElement.classList.add(goog.getCssName('mdl-js'));
      componentHandler.upgradeAllRegistered();
    } else {
      /**
       * Dummy function to avoid JS errors.
       */
      componentHandler.upgradeElement = function() {};
      /**
       * Dummy function to avoid JS errors.
       */
      componentHandler.register = function() {};
    }
  });
};
