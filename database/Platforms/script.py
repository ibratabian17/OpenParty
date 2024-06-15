import json

def compare_json(a_file, b_file, output_file):
    with open(a_file, 'r') as a:
        data_a = json.load(a)
    with open(b_file, 'r') as b:
        data_b = json.load(b)
    
    missing_keys = {key: data_a[key] for key in data_a if key not in data_b}

    with open(output_file, 'w') as output:
        json.dump(missing_keys, output, indent=4)

a_file = 'jd2017-nx/sku-packages.json'
b_file = 'jd2017-pc/sku-packages.json'
output_file = 'missing_keys.json'

compare_json(a_file, b_file, output_file)
