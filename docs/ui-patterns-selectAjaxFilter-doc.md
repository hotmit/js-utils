# UI.selectAjaxFilter
### Server Side
```python
# View
def ajax_get_shifts(request):
    selected = request.REQUEST.getlist('selected[]')
    facility_id = selected.pop()

    options = []

    if facility_id:
        options = AlarmShift.on_site.for_user(request.user)\
            .filter(facility_id=facility_id).values_list('name', 'id')
        options = [{'name': n, 'value': i} for n,i in options]

    return HttpResponse(Json.to_json(options))    
```

---
### Option Json Format
* Option
    * value: int|string
    * name: string
    * selected: bool - optional
    * id: string - optional
* OptGroup
    * optGroup: bool - the flag to indicate it's a optgroup
    * label: string - the label of the optgroup
    * id: string - optional
    * options: Array - array of sub options, this is optional

```json
[
    { value: "value", name: "display text", selected: false },
    { optGroup: true, label: "optGroup label", id: "optional id", options: [
        { value: "value", name: "display text", id: 7 },
        { value: "value", name: "display text", selected: false },
    ]},
    { value: "value", name: "display text" },
    { value: "value", name: "display text", selected: true }
]
```

---
### Html Setup
```html
<form>
    <select name="facility" id="id_facility">
        <option value="11">Vaughn Valley</option>
        <option value="12">Bristol</option>
        <option value="13">Summerlea</option>
    </select>

    <select name="alarm_shifts" id="id_alarm_shifts" multiple="multiple"></select>
 </form>
```

---
### JS Setup
```javascript
$(function(){
    
    UI.Patterns.selectAjaxFilter('#id_facility', '#id_alarm_shifts', 'get-shifts/');
    
});

```