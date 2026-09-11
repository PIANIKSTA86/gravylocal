import json

with open('scratch_collections.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

id_to_name = {details['id']: name for name, details in data.items()}

# Let's inspect all collections, their fields, resolved relations, select options, etc.
full_analysis = {}

for name, details in sorted(data.items()):
    col_type = details['type']
    fields = details['fields']
    field_list = []
    
    for f in fields:
        f_name = f.get('name')
        f_type = f.get('type')
        f_required = f.get('required', False)
        
        info = {
            'name': f_name,
            'type': f_type,
            'required': bool(f_required)
        }
        
        if f_type == 'relation':
            target_id = f.get('collectionId')
            target_name = id_to_name.get(target_id, target_id)
            info['relation_to'] = target_name
            info['cascadeDelete'] = f.get('cascadeDelete', False)
            info['maxSelect'] = f.get('maxSelect', 1)
            
        elif f_type == 'select':
            info['values'] = f.get('values', [])
            info['maxSelect'] = f.get('maxSelect', 1)
            
        elif f_type == 'file':
            info['maxSelect'] = f.get('maxSelect', 1)
            info['maxSize'] = f.get('maxSize')
            info['mimeTypes'] = f.get('mimeTypes', [])
            
        field_list.append(info)
        
    full_analysis[name] = {
        'id': details['id'],
        'type': col_type,
        'field_count': len(field_list),
        'fields': field_list
    }

with open('scratch/resolved_collections.json', 'w', encoding='utf-8') as f:
    json.dump(full_analysis, f, ensure_ascii=False, indent=2)

print(f"Successfully resolved {len(full_analysis)} collections!")
