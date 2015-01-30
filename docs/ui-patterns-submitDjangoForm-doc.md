# UI.submitDjangoForm
### Server Side

```python
# View
def view_alarm_comments(request):
    if request.POST:
        new_comment_form = AlarmResolutionForm(request.POST, request.FILES)
        if new_comment_form.is_valid():
            return Ajx.cmd_display_message(_('tis tis done'), refresh=True)
    else:
        new_comment_form = AlarmResolutionForm(
            initial={
                'alarm_status_id': request.GET.get('id', '0'),
            }
        )
    tmplt_data = {
        'site': {
            'title': _('Current Alarm Status'),
        },
        'form': {
            'new_comment': new_comment_form,
        },
    }
    return render(request, 'alarm_manager/view_alarm_comments.html', tmplt_data)    
```

```twig
{% load i18n %}{% load staticfiles %}
{% load lib_filters %}{% load lib_tags %}{% load tz %}
{% load crispy_forms_tags %}
<div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
    <h2 class="modal-title">{% trans 'Comments'|force_escape %}</h2>
</div>
<div class="modal-body">
    {% crispy form.new_comment %}
</div>
```

---
### Html Setup
```html
<a class="btn btn-primary btn-form" href="view-comments/">View Comments</a>
```

---
### JS Setup
```javascript
$(function(){
    var $btn = $('.btn-form');
    
    $btn.click(function(){
        Bs.modalAjax('my-new-modal-box-id', this.href, {size: 'lg', destroyOnClose: true}, function(){
                UI.submitDjangoForm('#alarm_comment_form');     // #alarm_comment_form is the form selector
            });
        return false;
    });
});

```