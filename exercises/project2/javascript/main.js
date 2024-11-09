"use strict"

const SCRYFALL_URL = "https://api.scryfall.com/cards/random?";

let search = SCRYFALL_URL;
let currentSet = "";


window.onload = getSetData;

let sets;

function find(value) {
    let dropdown = document.querySelector("#setSelector div");
    dropdown.innerHTML = "";
    

    for (let i = 0; i < sets.length; i++) {
        let set = sets[i];
        if (((set.set_type != "expansion" && set.set_type != "masters" && set.set_type != "draft_innovation" && set.set_type != "core") || set.parent_set_code != null || !set.name.toLowerCase().includes(value)) || set.card_count < 200){
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
    card.innerHTML = obj.name + " - " + obj.rarity;
    pack.appendChild(card);
    
}

function dataError(e) {
    console.log("An error occurred");
}

function createPack(setCode) {
    let terms = `q=s:${setCode}`;

    
      
    getCardData(search + terms + `+r:r+OR+s:${setCode}+r:m`);
    for (let i = 0; i < 3; i++) {
        getCardData(search + terms + `+r:u`);
        
    }
    for (let i = 0; i < 10; i++) {
        getCardData(search + terms + `+r:c+-type:land`);
    }
    getCardData(search + terms + `+type:land+r:c`);
    
}


