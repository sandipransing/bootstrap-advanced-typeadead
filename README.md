bootstrap-advanced-typeadead
============================

>This is an **extension** to bootstrap typeahead. It adds N-gram searching to the plugin.

>**Boootstrap Typeahead** is a basic, easily extended plugin for quickly creating elegant typeaheads with any form text input.

##Features:

1. default LR (left to right) search is replaced with N-gram search algoritham
2. `minLength: 0` will show all items. When user focus on input box it will start showing up items.

## Example

<input type="text" data-provide="typeahead" placeholder="Enter something here">
```html
<input type="text" data-provide="typeahead">
```

You'll want to set `autocomplete="off"` to prevent default browser menus from appearing over the Bootstrap typeahead dropdown.
## Usage

### Via data attributes
Add data attributes to register an element with typeahead functionality as shown in the example above.

### Via JavaScript
Call the typeahead manually with:

```javascript
$('.typeahead').typeahead()
```
```javascript
source = ["Something", "intereting", "something wrong with me"]

$('.typeahead').typeahead(source: source, minLength: 0, items: 4)
```
## Options
Options can be passed via data attributes or JavaScript. For data attributes, append the option name to `data-`, as in `data-source=""`.


Name  | Type | default | Description
:---|:---:|:---:|---
source  |   array, function |   [ ] |   The data source to query against. May be an array of strings or a function. The function is passed two arguments, the query value in the input field and the process callback. The function may be used synchronously by returning the data source directly or asynchronously via the process callback's single argument.
items | number  | 8 | The max number of items to display in the dropdown.
minLength | number |  1 | The minimum character length needed before triggering autocomplete suggestions
matcher | function |  case insensitive |  The method used to determine if a query matches an item. Accepts a single argument, the item against which to test the query. Access the current query with this.query. Return a boolean true if query is a match.
sorter |  function |  exact match, case sensitive,case insensitive |  Method used to sort autocomplete results. Accepts a single argument items and has the scope of the typeahead instance. Reference the current query with this.query.
updater | function |  returns selected item | The method used to return selected item. Accepts a single argument, the item and has the scope of the typeahead instance.
highlighter | function| highlights all default matches |  Method used to highlight autocomplete results. Accepts a single argument item and has the scope of the typeahead instance. Should return html.

For more info pleae visit: [Bootstrap Typeahead](http://getbootstrap.com/2.3.2/javascript.html#typeahead)
