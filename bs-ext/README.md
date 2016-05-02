

---
### BootstrapDialog
```javascript
BootstrapDialog.show({
    message: 'Hi Apple!'
});


BootstrapDialog.show({
    title: 'Default Title',
    message: 'Click buttons below.',
    buttons: [{
        label: 'Title 1',
        action: function(dialog) {
            dialog.setTitle('Title 1');
        }
    }, {
        label: 'Title 2',
        action: function(dialog) {
            dialog.setTitle('Title 2');
        }
    }]
});


var types = [BootstrapDialog.TYPE_DEFAULT, 
             BootstrapDialog.TYPE_INFO, 
             BootstrapDialog.TYPE_PRIMARY, 
             BootstrapDialog.TYPE_SUCCESS, 
             BootstrapDialog.TYPE_WARNING, 
             BootstrapDialog.TYPE_DANGER];
$.each(types, function(index, type){
    BootstrapDialog.show({
        type: type,
        title: 'Message type: ' + type,
        message: 'What to do next?',
        buttons: [{
            label: 'I do nothing.'
        }]
    });     
});

```