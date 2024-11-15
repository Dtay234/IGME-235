"use strict"

const SCRYFALL_URL = "https://api.scryfall.com/cards/random?";
const PLAY_BOOSTER_RELEASE = new Date(2024, 1, 9);
const MASTERPIECE_REWORK = new Date(2021, 3, 23);

let search = SCRYFALL_URL;
let currentSet = "";
let currentRank = 1;
let filterConditions = {};

window.addEventListener("load", getSetData);
window.addEventListener("load", setup);

let sets;

function setup() {
    document.querySelector("#newPack").onclick = createPack;
    let searchbar = document.querySelector("#searchbar");
    searchbar.onkeyup = find;
    document.querySelector("#JSONCopy").onclick = saveDataJSON;
    document.querySelector("body").onclick = () => {
        let selector = document.querySelector("#setSelector div");
        let hovered = selector.parentNode.querySelector(":hover");
        if (hovered != selector) {
            selector.innerHTML = "";
            selector.style.borderWidth = "0";
        }
        

        for (let item of document.querySelectorAll("div.card")) {
            if (item.parentNode.querySelector(":hover") == item) {
                continue;
            }
            item.style.borderWidth = "0px";
            item.dataset.selected = "f";
        }
    }
    let array = document.querySelectorAll("img.color");
    for (let item of array) {
        item.dataset.toggle = "off";
        item.onclick = (e) => {

            if (e.target.dataset.toggle == "off") {
                e.target.dataset.toggle = "on";
                if (item.id != "c" && item.id != "m") {
                    filterConditions[item.id] = (
                        (x) => {
                            return x.color.includes(e.target.id) || x.color == e.target.id;
                        });
                }
                else if (item.id == "m") {
                    filterConditions[item.id] = (
                        (x) => {
                            return x.color.length > 1;
                        });
                }
                else {
                    filterConditions[item.id] = (
                        (x) => {
                            return x.color == "";
                        });
                }
                
            }
            else {
                e.target.dataset.toggle = "off";
                filterConditions[item.id] = undefined;
            }

            displayData();

        };
    }

    let array2 = document.querySelectorAll("div.rarity");
    for (let item of array2) {
        item.dataset.toggle = "off";
        item.onclick = (e) => {

            if (e.target.dataset.toggle == "off") {
                e.target.dataset.toggle = "on";
                for (let thing of document.querySelectorAll("div.rarity")) {
                    if (thing != e.target) {
                        thing.dataset.toggle = "off";
                        filterConditions[thing.id] = undefined;
                    }
                    
                }
                filterConditions[item.id] = (
                    (x) => {
                        return x.rarity == e.target.id[0];
                    });
                
            }
            else {
                e.target.dataset.toggle = "off";
                filterConditions[item.id] = undefined;
            }

            displayData();

        };
    }

    let importButton = document.querySelector("#import");
    importButton.onclick = function(e) {
        let form = document.createElement("div");
        form.id = "importForm";
        let textField = document.createElement("input");
        textField.type = "text";
        form.appendChild(textField);
        let submit = document.createElement("button");
        submit.innerHTML = "Load";
        
        submit.onclick = (x) => {
            incoming(x.target.parentNode.querySelector("input").value);
        }

        form.appendChild(submit);

        document.querySelector("body").appendChild(form);
    }
}

//Data

let stats = {}

stats.data = {};



function selectCard(e) {
    let array = document.querySelectorAll("div.card");

    let selected;
    for (let item of array) {
        if (!stats.data[item.dataset.name]) {
            stats.data[item.dataset.name] = {appearances:0, points:0, color:item.dataset.color, rarity:item.dataset.rarity};
        }

        stats.data[item.dataset.name].appearances += 1;
        
        item.onclick = undefined;
        item.ondblclick = undefined;

        if (item.dataset.rank && item.dataset.rank != "none") {
            stats.data[item.dataset.name].points += (((2.0 - parseFloat(item.dataset.rank)) + 2.0) / 3);
            stats.header[1] += 1;
        }
    }
    
    
    displayData();
    let b1 = document.querySelector("#reset");
    b1.onclick = undefined;
    b1.dataset.inactive = "t";
    
    currentRank = 1;
}

function saveDataText() {
    let text = document.createElement("div");
    let header = document.createElement("p");
    header.innerHTML = currentSet;
    text.appendChild(header);

    for (let card in stats.data) {
        let p = document.createElement("p");
        p.innerHTML = `<p>${card.key}-</p>`
    }
}

function saveDataJSON() {
    let text = JSON.stringify(stats);
    navigator.clipboard.writeText(text);
}

function incoming(str) {
    stats = JSON.parse(str);
    displayData();
    document.querySelector("body").removeChild(document.querySelector("#importForm"));
}

function displayData() {
    let statDisplay = document.querySelector("#statsList");
    statDisplay.innerHTML = "";
    

    for (let item in stats.data) {

        let skip = false;
        for (let condition in filterConditions) {
            if (filterConditions[condition] && !(filterConditions[condition](stats.data[item]))) {
                skip = true;
                break;
            }
        }
        if (skip) {
            continue;
        }

        let element = document.createElement("p");
        let temp1 = parseFloat(`${stats.data[item].points}`);
        let temp2 = parseFloat(`${stats.data[item].appearances}`)
        element.innerHTML = item + " - " + (temp1/temp2 * 100).toFixed(2) + "%";
        element.dataset.percent = (temp1/temp2 * 100).toFixed(2);
        statDisplay.appendChild(element);
    }

    //sort the children by the percentage value
    [...statDisplay.children].sort(
        (a, b) => parseFloat(a.dataset.percent) < parseFloat(b.dataset.percent) ? 1 : -1)
        .forEach((x) => {
            if (x.dataset.percent != 0) 
                {statDisplay.append(x) }
            else {
                statDisplay.removeChild(x);
            }
        }
    );
}



//API and selection

function reset() {
    let array = document.querySelectorAll("div.card");

    for (let item of array) {
        item.dataset.selected = "f";
        item.dataset.rank = "none"
        item.ondblclick = rankCard;
        let child = item.querySelector("small");
        if (child) {item.removeChild(child);}
    }

    currentRank = 1;
}

function highlightCard(e) {
    
    this.style.border = "2px solid orange";
    this.dataset.selected = "t";
}

function rankCard(e) {
    if (currentRank == 4) {
        return;
    }
    this.dataset.rank = currentRank;
    
    this.ondblclick = undefined;
    let rankMarker = document.createElement("small");
    rankMarker.className = "rank";
    rankMarker.innerHTML = "#" + currentRank;
    this.appendChild(rankMarker);
    currentRank++;
    if (currentRank == 4) {
        selectCard();
    }
}

function find(e) {
    let value = e.target.value;
    let dropdown = document.querySelector("#setSelector div");
    dropdown.innerHTML = "";
    
    
    

    for (let i = 0; i < sets.length; i++) {
        let set = sets[i];
        if (((set.set_type != "expansion" 
                && set.set_type != "masters" 
                && set.set_type != "draft_innovation" 
                && set.set_type != "core") 
            || set.parent_set_code != null 
            || set.digital
            || (!set.name.toLowerCase().includes(value.toLowerCase())) 
                && !set.code.includes(value.toLowerCase())) 
                || set.card_count < 200){
            continue;
        }

        let element = document.createElement("div");
        element.style.display = "flex";
        element.style.alignItems = "center";
        let text = document.createElement("p");
        text.innerHTML = set.name + ` (${set.code.toUpperCase()})`;
        element.dataset.code = set.code;
        
        element.onclick = select;
        let img = document.createElement("img");
        img.src = set.icon_svg_uri;
        img.alt = "";
        
        element.appendChild(img);
        element.appendChild(text);
        dropdown.appendChild(element);
    }

    if (dropdown.children.length > 0) {
        dropdown.style.borderThickness = "2px";
    }
}



function select(e) {
    document.querySelector("#pack").innerHTML = "";
    currentSet = e.target.innerHTML.toLowerCase().match(/\((.*)\)/)[0];
    currentSet = currentSet.replace('(', '').replace(')', '');
    let searchbar = document.querySelector("#setSelector input");
    searchbar.value = currentSet.toUpperCase();
    let dropdown = document.querySelector("#setSelector div");
    dropdown.innerHTML = "";
    dropdown.style.borderThickness = "0";
    stats.header = [currentSet, 0];

    createPack(currentSet);
}


function setDataLoaded(e) {
    let xhr = e.target;

    let obj = JSON.parse(xhr.responseText);
    sets = obj.data;
}


function getCardData(url) {
    let xhr = new XMLHttpRequest();
    xhr.onload = cardDataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET", url);
    xhr.send();
}

function getSetData() {
    let xhr = new XMLHttpRequest();
    xhr.onload = setDataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET", "https://api.scryfall.com/sets");
    xhr.send();
}

function cardDataLoaded(e) {
    let xhr = e.target;

    let obj = JSON.parse(xhr.responseText);

    let pack = document.querySelector("#pack");
    let card = document.createElement("div");
    card.className = "card";
    let strColor = "";
    for (let c in obj.colors) {
        strColor += obj.colors[c].toLowerCase();
    }
    card.dataset.color = strColor;
    card.dataset.rarity = obj.rarity[0];
    
    if (obj.card_faces) {
        card.innerHTML = `<img src="${obj.card_faces[0].image_uris.normal}" alt="${obj.name}">`;
        card.dataset.side = 0;
        card.dataset.dfc = true;
        let flip = document.createElement("button");
        flip.innerHTML = "Flip";
        flip.onclick = function(e) {
            let parent = e.target.parentElement;
            let rank = parent.querySelector("small");
            if (parent.dataset.side == 0) {
                parent.innerHTML = `<img src="${obj.card_faces[1].image_uris.normal}" alt="${obj.name}">`;
                parent.dataset.side = 1;
            }
            else {
                parent.innerHTML = `<img src="${obj.card_faces[0].image_uris.normal}" alt="${obj.name}">`;
                parent.dataset.side = 0;
            }
            parent.appendChild(this);
            parent.appendChild(rank);
        }
        card.appendChild(flip);
    }
    else {
        card.innerHTML = `<img src="${obj.image_uris.normal}" alt="${obj.name}">`;
    }
    
    
    
    card.onclick = highlightCard;
    card.ondblclick = rankCard;
    card.dataset.name = obj.name;
    pack.appendChild(card);
    
}

function dataError(e) {
    console.log("An error occurred");
}

function createPack() {
    
    let terms = `q=s:${currentSet}`;
    document.querySelector("#pack").innerHTML = "";

    let setData;
    for (let x of sets) {
        if (x.code == currentSet) {
            setData = x;
            break;
        }
    }
    let dateData = setData.released_at.split('-');
    let date = new Date(parseInt(dateData[0]), parseInt(dateData[1]), parseInt(dateData[2]));
    if (date - PLAY_BOOSTER_RELEASE > 0) {
        getCardData(search + terms + "+-type:basic");
        getCardData(search + terms + "+-type:basic");
        getCardData(search + terms + `+r:r+OR+s:${currentSet}+r:m`);
        for (let i = 0; i < 3; i++) {
            getCardData(search + terms + `+r:u`);
        
        }
        for (let i = 0; i < 5; i++) {
            getCardData(search + terms + `+r:c+-type:land`);
        }
        let bonusSheetCode;
        for (let x of sets) {
            if (x.parent_set_code == currentSet && x.set_type == "masterpiece") {
                bonusSheetCode = x.code;
                break;
            }
        }
        if (bonusSheetCode && date - MASTERPIECE_REWORK > 0) {
            getCardData(search + `q=s:${bonusSheetCode}`);
        }
        else {
            getCardData(search + terms + `+r:c+-type:land`);
        }
        getListCard(currentSet, setData.released_at);
        getCardData(search + terms + `+type:land+r:c`);
    }
    else {
        getCardData(search + terms + `+r:r++OR+s:${currentSet}+r:m`);
        for (let i = 0; i < 3; i++) {
            getCardData(search + terms + `+r:u`);
        
        }
        for (let i = 0; i < 9; i++) {
            getCardData(search + terms + `+r:c+-type:land`);
        }
        let bonusSheetCode;
        for (let x of sets) {
            if (x.parent_set_code == currentSet && x.set_type == "masterpiece") {
                bonusSheetCode = x.code;
                break;
            }
        }
        if (bonusSheetCode && date - MASTERPIECE_REWORK < 0 && Math.random() < 1.0/144.0 && bonusSheetCode != "zne" ) {
            getCardData(search + `q=s:${bonusSheetCode}`);
        }
        else if (bonusSheetCode == "bot" && Math.random() < 0.12) {
            getCardData(search + `q=s:${bonusSheetCode}`);
        }
        else if (bonusSheetCode && date - MASTERPIECE_REWORK > 0 && bonusSheetCode != "rex")  {
            getCardData(search + `q=s:${bonusSheetCode}`);
        }
        else {
            getCardData(search + terms + `+r:c+-type:land`);
        }
        getCardData(search + terms + `+type:land+r:c`);
    }

    
    let b1 = document.querySelector("#reset");
    b1.onclick = reset;
    b1.dataset.inactive = "f";
    
    
}

function getListCard(setCode, releaseDate) {
    let rand = Math.random();
    if (rand < 7.0/8.0) {
        getCardData(search + `q=s:${currentSet}+r:c+-type:land`);
    }
    else {
        let bonusSheetCode;
        for (let x of sets) {
            if (x.parent_set_code == currentSet && x.set_type == "expansion") {
                bonusSheetCode = x.code;
                break;
            }
        }
        getCardData(search + `q=s:spg+date=${releaseDate}+OR+s:${bonusSheetCode}`);
    }
}


