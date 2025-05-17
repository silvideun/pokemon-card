import { manualTranslate, reverseTranslate, translateAbility, abilityDescriptionTranslate } from "./translate.js";

const API_URL = "https://pokeapi.co/api/v2/pokemon/";

const pokemonNameElement = document.getElementById("pokemon-name");
const pokemonHpElement = document.getElementById("pokemon-hp-value");
const pokemonTypeIconElement = document.getElementById("pokemon-type-icon");
const pokemonImageElement = document.getElementById("pokemon-image");
const energyIconElement = document.getElementById("energy-icon");
const abilityNameElement = document.getElementById("ability-name");
const abilityDescriptionElement = document.getElementById("ability-description");


document.getElementById('pokemon-name').classList.add('glow-animate');

// Функция установки слабостей покемона
async function setPokemonWeaknesses(data) {
    const weaknessList = document.getElementById("weakness-list");
    weaknessList.innerHTML = "";

    if (!data || !data.types) return;

    // Получаем типы покемона
    const types = data.types.map(t => t.type.name);

    // Получаем данные о слабостях из PokeAPI (type endpoint)
    const typeDatas = await Promise.all(
        types.map(type =>
            fetch(`https://pokeapi.co/api/v2/type/${type}`)
                .then(res => res.json())
        )
    );

    // Собираем все double_damage_from
    const weaknesses = new Set();
    typeDatas.forEach(typeData => {
        typeData.damage_relations.double_damage_from.forEach(w => weaknesses.add(w.name));
    });

    // Выводим иконки слабостей
    weaknesses.forEach(type => {
        const img = document.createElement("img");
        img.src = `icons/${type}.svg`;
        img.alt = type;
        img.title = type;
        img.className = `type-icon ${type}`; // исправлено!
        weaknessList.appendChild(img);
    });
}


// атака и защита
function setPokemonStats(data) {
    const attackValueElement = document.getElementById("attack-value");
    const defenseValueElement = document.getElementById("defense-value");

    if (!data || !data.stats) {
        attackValueElement.textContent = "???";
        defenseValueElement.textContent = "???";
        return;
    }

    const attack = data.stats.find(stat => stat.stat.name === "attack");
    const defense = data.stats.find(stat => stat.stat.name === "defense");

    attackValueElement.textContent = attack ? attack.base_stat : "???";
    defenseValueElement.textContent = defense ? defense.base_stat : "???";
}



async function setPokemonAttackDamage(data) {
    const attackDamageElement = document.getElementById("attack-damage");
    if (!data || !data.moves || data.moves.length === 0) {
        attackDamageElement.textContent = "—";
        return;
    }

    // Найти первый move с ненулевым power
    let moveWithPower = null;
    for (const moveEntry of data.moves) {
        const response = await fetch(moveEntry.move.url);
        const moveData = await response.json();
        if (moveData.power !== null) {
            moveWithPower = moveData;
            break;
        }
    }

    attackDamageElement.textContent = moveWithPower && moveWithPower.power !== null
        ? moveWithPower.power
        : "—";
}

// Функция установки способности покемона
async function setPokemonAbility(data) {
    if (!data || !data.abilities || data.abilities.length === 0) {
        abilityNameElement.textContent = "Нет способностей";
        abilityDescriptionElement.textContent = "";
        return;
    }

    const ability = data.abilities[0].ability;
    // Используем перевод для названия способности
    abilityNameElement.textContent = (translateAbility(ability.name) || ability.name).replace(/-/g, ' ');

    try {
        const response = await fetch(ability.url);
        const abilityData = await response.json();
        // Ищем описание на русском или английском
        const entry = abilityData.effect_entries.find(e => e.language.name === "ru") ||
                      abilityData.effect_entries.find(e => e.language.name === "en");
        const customDescription = abilityDescriptionTranslate(ability.name);
        abilityDescriptionElement.textContent =
            customDescription ||
            (entry ? entry.short_effect : "Нет описания");
    } catch (e) {
        abilityDescriptionElement.textContent = "Нет описания";
    }
}

// Функция получения данных о покемоне
async function fetchPokemonData(pokemonName) {
    try {
        // Приводим к строке и только если это строка, делаем toLowerCase
        const nameOrId = typeof pokemonName === "string" ? pokemonName.toLowerCase() : pokemonName;
        const url = `${API_URL}${nameOrId}/`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Покемон не найден");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Функция установки имени покемона
function setPokemonName(data) {
    pokemonNameElement.textContent = data ? manualTranslate(data.name) : "Ошибка";
}

// Функция установки здоровья покемона
function setPokemonHp(data) {
    const hp = data?.stats.find(stat => stat.stat.name === "hp");
    pokemonHpElement.textContent = hp ? hp.base_stat : "Неизвестно";
}

// Функция установки типа покемона
function setPokemonType(data) {
    const type = data?.types[0]?.type.name || "unknown";

    pokemonTypeIconElement.className = "pokemon-type-icon";
    pokemonTypeIconElement.classList.add(type);
    
    pokemonTypeIconElement.src = `icons/${type}.svg`;
    pokemonTypeIconElement.alt = `${type.charAt(0).toUpperCase() + type.slice(1)} Type`;

    energyIconElement.className = "energy-icon-type";
    energyIconElement.classList.add(type);
    energyIconElement.src = `icons/${type}.svg`;
    energyIconElement.alt = `Энергия: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
}

// Функция установки изображения покемона
function setPokemonImage(data) {
    const pixelImageUrl = data?.sprites?.front_default || "";
    pokemonImageElement.src = pixelImageUrl;
    pokemonImageElement.alt = data ? `${manualTranslate(data.name)} Image` : "Неизвестно";
}

// Основная функция загрузки данных
async function loadPokemonData(pokemonName) {
    const data = await fetchPokemonData(pokemonName);
    
    setPokemonName(data);
    setPokemonHp(data);
    setPokemonType(data);
    setPokemonImage(data);
    setPokemonAbility(data);
    setPokemonAttackDamage(data);
    setPokemonStats(data);
    await setPokemonWeaknesses(data);
}

// Максимальное количество покемонов в PokeAPI (на май 2025 — 1025, можно увеличить при необходимости)
const MAX_POKEMON_ID = 1025;

// Находим кнопку
const randomBtn = document.getElementById('random-pokemon-btn');
if (randomBtn) {
    randomBtn.addEventListener('click', () => {
        const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
        loadPokemonData(randomId);
        // Если есть input, можно очистить или подставить id:
        if (pokemonInput) pokemonInput.value = '';
    });
}

// === Голографическая анимация карточки ===
window.addEventListener('DOMContentLoaded', () => {
    // Загружаем случайного покемона при старте
    const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
    loadPokemonData(randomId);

    const container = document.querySelector('.card-container');
    const card = document.querySelector('.card-body');
    if (!container || !card) return;
    card.classList.add('card');

    let styleTag = document.createElement('style');
    document.head.appendChild(styleTag);
    let xTimeout;

    function handleMove(e) {
        let pos;
        if (e.type === "touchmove") {
            const rect = container.getBoundingClientRect();
            pos = [
                e.touches[0].clientX - rect.left,
                e.touches[0].clientY - rect.top
            ];
        } else {
            const rect = container.getBoundingClientRect();
            pos = [
                e.clientX - rect.left,
                e.clientY - rect.top
            ];
        }
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        const l = pos[0];
        const t = pos[1];
        const px = Math.abs(Math.floor(100 / w * l) - 100);
        const py = Math.abs(Math.floor(100 / h * t) - 100);
        const pa = (50 - px) + (50 - py);
        const lp = (50 + (px - 50) / 1.5);
        const tp = (50 + (py - 50) / 1.5);
        const px_spark = (50 + (px - 50) / 7);
        const py_spark = (50 + (py - 50) / 7);
        const p_opc = 20 + (Math.abs(pa) * 1.5);
        const ty = ((tp - 50) / 2) * -1;
        const tx = ((lp - 50) / 1.5) * .5;

        styleTag.innerHTML = `
          .card:hover::before { background-position: ${lp}% ${tp}%; }
          .card:hover::after { background-position: ${px_spark}% ${py_spark}%; opacity: ${p_opc/100}; }
        `;

        card.style.transform = `rotateX(${ty}deg) rotateY(${tx}deg)`;
        card.classList.remove('animated');
        clearTimeout(xTimeout);
    }

    function handleOut() {
        styleTag.innerHTML = "";
        card.style.transform = "";
        xTimeout = setTimeout(() => {
            card.classList.add('animated');
        }, 2500);
    }

    container.addEventListener('mousemove', handleMove);
    container.addEventListener('touchmove', handleMove, {passive: false});
    container.addEventListener('mouseout', handleOut);
    container.addEventListener('touchend', handleOut);
    container.addEventListener('touchcancel', handleOut);
});


