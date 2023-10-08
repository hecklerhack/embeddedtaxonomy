# Embedded Taxonomy Display

For displaying taxonomy in hierarchy

## Usage
To include the script:
```
<script type="module" src='index.js'></script>
```

To display taxonomy to an HTMl element, add source (taxonomy in json) and behavior.

```
<input id="anything_3" type="text" source="health" behavior="search" />
```

To add your own taxonomy, import the json file(s) and add them in the variables as follows:

```
import ageGroup from './json/ageGroup.json' assert { type: 'json' };
import health from './json/health.json' assert { type: 'json' };

...

function main(){
    // element IDs
    const fields = ["anything_2", "anything_3"]; 

    // json mapping
    const jsonObject = {
        "ageGroup": ageGroup,
        "health": health
    };
}
```

See the index.html file for a sample.