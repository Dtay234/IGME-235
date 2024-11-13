"use strict"

const SCRYFALL_URL = "https://api.scryfall.com/cards/random?";
const PLAY_BOOSTER_RELEASE = new Date(2024, 1, 9);
const MASTERPIECE_REWORK = new Date(2021, 3, 23);

let search = SCRYFALL_URL;
let currentSet = "";


window.addEventListener("load", getSetData);
window.addEventListener("load", setup);

let sets;

function setup() {
    document.querySelector("#newPack").onclick = createPack;
    document.querySelector("body").onclick = () => {
        document.querySelector("#setSelector div").innerHTML = "";
        for (let item of document.querySelectorAll("div.card")) {
            if (item.parentNode.querySelector(":hover") == item) {
                continue;
            }
            item.style.borderWidth = "0px";
            item.dataset.selected = "f";
        }
    }
}

//Data storage

let stats = {}

stats.data = {};

function selectCard(e) {
    let array = document.querySelectorAll("div.card");

    let selected;
    for (let item of array) {
        if (!stats.data[item.dataset.name]) {
            stats.data[item.dataset.name] = {appearances:0, picks:0};
        }

        stats.data[item.dataset.name].appearances += 1;
        
        item.onclick = undefined;
        item.ondblclick = undefined;

        if (item.dataset.selected == "t") {
            selected = item;
        }
    }
    
    stats.data[selected.dataset.name].picks += 1;
    stats.header[1] += 1;

    let statDisplay = document.querySelector("#stats");
    statDisplay.innerHTML = "";

    

    for (let item in stats.data) {
        let element = document.createElement("p");
        let temp1 = parseFloat(`${stats.data[item].picks}`);
        let temp2 = parseFloat(`${stats.data[item].appearances}`)
        element.innerHTML = item + " - " + (temp1/temp2 * 100).toFixed(2) + "%";
        element.dataset.percent = (temp1/temp2 * 100).toFixed(2);
        statDisplay.appendChild(element);
    }

    //sort the children by the percentage value
    [...statDisplay.children].sort(
        (a, b) => parseFloat(a.dataset.percent) < parseFloat(b.dataset.percent) ? 1 : -1)
        .forEach(x => statDisplay.append(x));
    
    
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

}














//API and selection


function highlightCard(e) {
    
    this.style.border = "2px solid orange";
    this.dataset.selected = "t";
}

function find(value) {
    let dropdown = document.querySelector("#setSelector div");
    dropdown.innerHTML = "";
    dropdown.style.borderThickness = "2px";
    

    for (let i = 0; i < sets.length; i++) {
        let set = sets[i];
        if (((set.set_type != "expansion" 
                && set.set_type != "masters" 
                && set.set_type != "draft_innovation" 
                && set.set_type != "core") 
            || set.parent_set_code != null 
            || (!set.name.toLowerCase().includes(value.toLowerCase())) 
                && !set.code.includes(value.toLowerCase())) 
                || set.card_count < 200){
            continue;
        }

        let element = document.createElement("p");
        element.innerHTML = set.name + ` (${set.code.toUpperCase()})`;
        element.dataset.code = set.code;
        dropdown.appendChild(element);
        element.onclick = select;
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
    sets=obj.data;
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
    
    if (obj.card_faces) {
        card.innerHTML = `<img src="${obj.card_faces[0].image_uris.normal}" alt="${obj.name}">`;
        card.dataset.side = 0;
        card.dataset.dfc = true;
        let flip = document.createElement("button");
        flip.innerHTML = "Flip";
        flip.onclick = function(e) {
            let parent = e.target.parentElement;
            if (parent.dataset.side == 0) {
                parent.innerHTML = `<img src="${obj.card_faces[1].image_uris.normal}" alt="${obj.name}">`;
                parent.dataset.side = 1;
            }
            else {
                parent.innerHTML = `<img src="${obj.card_faces[0].image_uris.normal}" alt="${obj.name}">`;
                parent.dataset.side = 0;
            }
            parent.appendChild(this);
        }
        card.appendChild(flip);
    }
    else {
        card.innerHTML = `<img src="${obj.image_uris.normal}" alt="${obj.name}">`;
    }
    
    
    
    card.onclick = highlightCard;
    card.ondblclick = selectCard;
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
        if (bonusSheetCode && date - MASTERPIECE_REWORK < 0 && Math.random() < 1.0/144.0 && bonusSheetCode != "zne") {
            getCardData(search + `q=s:${bonusSheetCode}`);
        }
        else if (bonusSheetCode == "bot" && Math.random() < 0.12) {
            getCardData(search + `q=s:${bonusSheetCode}`);
        }
        else if (bonusSheetCode && date - MASTERPIECE_REWORK > 0) {
            getCardData(search + `q=s:${bonusSheetCode}`);
        }
        else {
            getCardData(search + terms + `+r:c+-type:land`);
        }
        getCardData(search + terms + `+type:land+r:c`);
    }

    
      
    
    
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


