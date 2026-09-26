const API_BASE_URL = "https://pokeapi.co/api/v2";

let pokemonList = [];
let fighter1 = null;
let fighter2 = null;
let battleOver = false;

const pokemon1SearchInput = document.getElementById("pokemon-1-search");
const pokemon1Suggestions = document.getElementById("pokemon-1-suggestions");
const pokemon1Status = document.getElementById("pokemon-1-status");
const pokemon1Preview = document.getElementById("pokemon-1-preview");

const pokemon2SearchInput = document.getElementById("pokemon-2-search");
const pokemon2Suggestions = document.getElementById("pokemon-2-suggestions");
const pokemon2Status = document.getElementById("pokemon-2-status");
const pokemon2Preview = document.getElementById("pokemon-2-preview");

function debounce(callback, delay) {
    let timeoutId;

    return function () {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(function () {
            callback();
        }, delay);
    };
}

async function fetchPokemonList() {
    const response = await fetch(
        `${API_BASE_URL}/pokemon?limit=1000`
    );

    if (!response.ok) {
        throw new Error("No se pudo cargar la lista de Pokémon.");
    }

    const data = await response.json();

    return data.results;
}

async function fetchPokemonDetails(nameOrId) {
    const response = await fetch(`${API_BASE_URL}/pokemon/${nameOrId}`);

    if (!response.ok) {
        throw new Error("No se encontró el Pokémon.");
    }

    const data = await response.json();

    return data;
}

function formatPokemonData(data) {
    const hpStat = data.stats.find(function (statItem) {
        return statItem.stat.name === "hp";
    });

    const moves = data.moves
        .slice(0, 4)
        .map(function (moveItem) {
            return moveItem.move.name;
        });

    return {
        name: data.name,
        sprite: data.sprites.front_default,
        maxHp: hpStat.base_stat,
        currentHp: hpStat.base_stat,
        moves: moves
    };
}

function renderPokemonPreview(pokemon, previewContainer) {
    const name = document.createElement("h4");
    name.textContent = pokemon.name;

    const sprite = document.createElement("img");
    sprite.src = pokemon.sprite;
    sprite.alt = pokemon.name;

    const hp = document.createElement("p");
    hp.textContent = `HP: ${pokemon.currentHp}`;

    const movesContainer = document.createElement("div");

    pokemon.moves.forEach(function (move) {
        const moveButton = document.createElement("button");

        moveButton.type = "button";
        moveButton.textContent = move;
        moveButton.disabled = true;

        movesContainer.appendChild(moveButton);
    });

    previewContainer.replaceChildren(
        name,
        sprite,
        hp,
        movesContainer
    );
}

async function selectPokemon(name, fighterNumber) {
    let searchInput;
    let suggestionsContainer;
    let statusElement;
    let previewContainer;

    if (fighterNumber === 1) {
        searchInput = pokemon1SearchInput;
        suggestionsContainer = pokemon1Suggestions;
        statusElement = pokemon1Status;
        previewContainer = pokemon1Preview;
    } else {
        searchInput = pokemon2SearchInput;
        suggestionsContainer = pokemon2Suggestions;
        statusElement = pokemon2Status;
        previewContainer = pokemon2Preview;
    }

    suggestionsContainer.replaceChildren();

    searchInput.disabled = true;
    statusElement.textContent = "Cargando detalles...";

    try {
        const data = await fetchPokemonDetails(name);
        const pokemon = formatPokemonData(data);

        if (fighterNumber === 1) {
            fighter1 = pokemon;
        } else {
            fighter2 = pokemon;
        }

        renderPokemonPreview(pokemon, previewContainer);

        searchInput.value = pokemon.name;
        statusElement.textContent = `${pokemon.name} seleccionado.`;

        searchInput.disabled = false;
    } catch (error) {
        statusElement.textContent = "No se pudo cargar el Pokémon.";

        searchInput.disabled = false;

        console.error(error.message);
    }
}

async function loadPokemonList() {
    pokemon1SearchInput.disabled = true;
    pokemon2SearchInput.disabled = true;

    pokemon1Status.textContent = "Cargando Pokémon...";
    pokemon2Status.textContent = "Cargando Pokémon...";

    try {
        pokemonList = await fetchPokemonList();

        pokemon1SearchInput.disabled = false;
        pokemon2SearchInput.disabled = false;

        pokemon1Status.textContent = "";
        pokemon2Status.textContent = "";
    } catch (error) {
        pokemon1Status.textContent = "No se pudo cargar la lista de Pokémon.";

        pokemon2Status.textContent = "No se pudo cargar la lista de Pokémon.";

        console.error(error.message);
    }
}

function searchPokemon(
    searchInput,
    suggestionsContainer,
    statusElement,
    fighterNumber
) {
    const searchTerm = searchInput.value.trim().toLowerCase();

    suggestionsContainer.replaceChildren();

    if (searchTerm === "") {
        statusElement.textContent = "";
        return;
    }

    const matches = pokemonList
        .filter(function (pokemon) {
            return pokemon.name.includes(searchTerm);
        })
        .slice(0, 10);

    if (matches.length === 0) {
        statusElement.textContent = "No se encontraron Pokémon.";
        return;
    }

    statusElement.textContent = "";

    matches.forEach(function (pokemon) {
        const suggestionButton = document.createElement("button");

        suggestionButton.type = "button";
        suggestionButton.textContent = pokemon.name;

        suggestionButton.addEventListener(
            "click",
            function () {
                selectPokemon(
                    pokemon.name,
                    fighterNumber
                );
            }
        );

        suggestionsContainer.appendChild(suggestionButton);
    });
}

const debouncedSearchPokemon1 = debounce(function () {
        searchPokemon(pokemon1SearchInput, pokemon1Suggestions, pokemon1Status, 1);
    }, 400);

const debouncedSearchPokemon2 = debounce(function () {
        searchPokemon(pokemon2SearchInput, pokemon2Suggestions, pokemon2Status, 2);
    }, 400);

pokemon1SearchInput.addEventListener("input", debouncedSearchPokemon1);
pokemon2SearchInput.addEventListener("input", debouncedSearchPokemon2);

loadPokemonList();