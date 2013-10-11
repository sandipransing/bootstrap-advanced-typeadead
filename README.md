bootstrap-advanced-typeadead
============================

Extension of bootstrap typeahead which adds support of N gram search to plugin

Features: 
#### N-gram search
#### minLength 0

#### Usage

```javascript
  $('.typeahead').typeahead()
```javascript
  $('.typeahead').typeahead(source: ["Something", "intereting", "something wrong with me"], minLength: 0, items: 4)

#### Options
1. source : The data source to query against. May be an array of strings or a function. The function is passed two arguments, the query value in the input field and the process callback. The function may be used synchronously by returning the data source directly or asynchronously via the process callback's single argument.
2. items : The max number of items to display in the dropdown.
3. minLength : The minimum character length needed before triggering autocomplete suggestions

For more info visit: http://getbootstrap.com/2.3.2/javascript.html#typeahead
