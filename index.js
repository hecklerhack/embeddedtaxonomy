import ageGroup from './json/ageGroup.json' assert { type: 'json' };
import health from './json/health.json' assert { type: 'json' };

class CheckboxTreeFactory {
    constructor(json, containerKey, behavior) {
        this.json = json;
        this.key = containerKey;
        this.behavior = behavior;
    }

    createCheckbox(id, parentId = "", checked = false, disabled = false) {
        const checkbox = document.createElement("input");
        checkbox.id = id;
        checkbox.type = "checkbox";
        checkbox.value = id;
        checkbox.disabled = disabled;
        checkbox.checked = checked;
        if (parentId !== "") {
            checkbox.setAttribute("data-parent", parentId);
            checkbox.toggleAttribute("hasParent");
        }
        return checkbox;
    }

    createLabel(name, code, synonyms) {
        const labelContainer = document.createElement("span");
        const label = document.createElement("a");
        label.className = "link";
        label.style.position = "relative";
        label.innerText = name;

        const tooltipText = document.createElement("span");
        tooltipText.className = "tooltip";
        tooltipText.innerHTML = "<span>Code: " + code + "</span><br><span>Synonyms: " +
            (synonyms !== undefined && synonyms.length > 0 ? synonyms.map(syn => syn.name).join("<br>") : "<br>No synonyms.") +
            "</span>";

        labelContainer.append(label);

        label.addEventListener("click", (e) => {
            tooltipText.style.visibility = "visible";
            label.appendChild(tooltipText, label);
            setTimeout(() => {
                tooltipText.style.visibility = "hidden";
                if (label.lastElementChild === tooltipText) {
                    label.removeChild(tooltipText);
                }
            }, 10000);
        })
        return label;
    }

    createButton(parentId) {
        const button = document.createElement("button");
        button.id = "btn-" + parentId;
        button.innerHTML = "-";
        button.type = "button";
        button.className = "toggle btn-extension";
        button.addEventListener("click", (e) => {
            const children = Array.from(document.getElementsByClassName("div-" + parentId));
            for (let child of children) {
                if (child.style.display == "none") {
                    child.style.display = "block";
                    button.innerHTML = "-";
                } else {
                    child.style.display = "none";
                    button.innerHTML = "+";
                }
            }
        });
        return button;
    }

    createMarginBeforeChild(counter) {
        var margin = document.createElement("span");
        margin.style.paddingLeft = (3 * counter) + "vw";
        return margin;
    }

    generateFamilyTree(json, level = 0, parentId = "") {
        const checkboxContainer = document.createElement("span");

        if (json["name"] !== undefined) {
            const checkbox = this.createCheckbox(json["id"], parentId, json["selected"], json["checkable"]);
            checkboxContainer.append(checkbox);
            checkboxContainer.append(this.createLabel(json["name"], json["id"], json["synonyms"]));
            if (json["children"] !== undefined) {
                const button = this.createButton(json["id"]);
                checkboxContainer.append(button);
            }
            checkboxContainer.append(document.createElement("br"));

            if (this.json["version"] && (
                ((level === 2) && this.json["version"] === "short") || ((level === 4) && this.json["version"] === "long")
            )) {
                return checkboxContainer;
            } else {
                if (json["children"] !== undefined && json["children"].length > 0) {
                    json["children"].forEach(child => {
                        const childCheckboxContainer = document.createElement("div");
                        childCheckboxContainer.className = "div-" + json["id"];
                        childCheckboxContainer.append(this.createMarginBeforeChild(level + 1));
                        const childNode = this.generateFamilyTree(child, level + 1, json["id"]);
                        childCheckboxContainer.append(childNode);
                        checkboxContainer.append(childCheckboxContainer);
                    });
                }
            }
        }
        return checkboxContainer;
    }

    createCheckboxTree() {
        return this.generateFamilyTree(this.json);
    }

    /**
     * Behavior: Check all parents when child is checked
     */
    profileBehavior() {

        function getParents() {
            const children = getChildren();
            const parents = [];
            children.forEach(child => {
                parents.push(document.getElementById(child.getAttribute("data-parent")));
            });
            return parents;
        }

        function getChildren() {
            const children = Array.from(document.querySelectorAll("[data-parent]"));
            return children;
        }

        const parents = getParents();

        function uncheckAllChildren(child) {
            child.checked = false;
            const grandchildren = document.querySelectorAll("[data-parent=\"" + child.id + "\"]");
            if (grandchildren !== undefined && grandchildren.length > 0) {
                grandchildren.forEach(grandchild => uncheckAllChildren(grandchild));
            }
        }

        function checkAllParents(child) {
            const parent = document.getElementById(child.getAttribute("data-parent"));
            if (child.checked) {
                parent.checked = true;
            }
            if (parent.hasAttribute("data-parent")) {
                checkAllParents(parent);
            }
        }

        parents.forEach(parent => {
            const children = document.querySelectorAll("[data-parent=\"" + parent.id + "\"]");
            parent.addEventListener("change", e => {
                children.forEach(child => {
                    if (!e.target.checked && child.checked) {
                        uncheckAllChildren(child);
                    }
                });
            });
            children.forEach(child => {
                child.addEventListener("change", e => {
                    checkAllParents(child);
                })
            });
        });
    }

    create() {
        const jsonContainer = document.getElementById(this.key);
        if (jsonContainer.lastElementChild && jsonContainer.lastElementChild !== undefined) {
            jsonContainer.removeChild(jsonContainer.lastElementChild);
        }

        let container = document.createElement("div");
        container.className = "checkbox-container";

        container.append(this.createCheckboxTree());
        jsonContainer.append(container);

        const id = "btn-" + this.json["id"];
        this.json["allOpen"] !== undefined && this.json["allOpen"] === false && document.getElementById(id).click();

        if(this.behavior === "profile"){
            this.profileBehavior();
        }

        return jsonContainer;
    }
}


function setupTaxonomy(key, source, behavior) {
    const node = document.createElement("div");
    node.style.backgroundColor = "#fff";
    document.getElementById(key).replaceWith(node);
    node.id = key;

    // create taxonomy
    const group = new CheckboxTreeFactory(source, key, behavior);
    group.create();
}

function main() {
    // element IDs
    const fields = ["anything_2", "anything_3"]; 

    // json mapping
    const jsonObject = {
        "ageGroup": ageGroup,
        "health": health
    };

    fields.forEach(key => {
        const source = document.getElementById(key).attributes.getNamedItem("source");
        const behavior = document.getElementById(key).attributes.getNamedItem("behavior").value;
        setupTaxonomy(key, jsonObject[source.value], behavior);
    });
}

main();