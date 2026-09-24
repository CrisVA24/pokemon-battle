const API_BASE_URL = "https://pokeapi.co/api/v2";

let pokemonList = [];
let fighter1 = null;
let fighter2 = null;
let battleOver = false;

const pokemon1SearchInput = document.getElementById("pokemon-1-search");
const pokemon1Suggestions = document.getElementById("pokemon-1-suggestions");
const pokemon1Status = document.getElementById("pokemon-1-status");

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
    const response = await fetch(
        `${API_BASE_URL}/pokemon/${nameOrId}`
    );

    if (!response.ok) {
        throw new Error("No se encontró el Pokémon.");
    }

    const data = await response.json();

    return data;
}

async function loadPokemonList() {
    try {
        pokemonList = await fetchPokemonList();
    } catch (error) {
        console.error(error.message);
    }
}

function searchPokemon1() {
    const searchTerm =
        pokemon1SearchInput.value.trim().toLowerCase();

    pokemon1Suggestions.replaceChildren();

    if (searchTerm === "") {
        pokemon1Status.textContent = "";
        return;
    }

    const matches = pokemonList
        .filter(function (pokemon) {
            return pokemon.name.includes(searchTerm);
        })
        .slice(0, 10);

    if (matches.length === 0) {
        pokemon1Status.textContent =
            "No se encontraron Pokémon.";
        return;
    }

    pokemon1Status.textContent = "";

    matches.forEach(function (pokemon) {
        const suggestionButton =
            document.createElement("button");

        suggestionButton.type = "button";
        suggestionButton.textContent = pokemon.name;

        pokemon1Suggestions.appendChild(
            suggestionButton
        );
    });
}

const debouncedSearchPokemon1 = debounce(searchPokemon1, 400);

pokemon1SearchInput.addEventListener("input", debouncedSearchPokemon1);

loadPokemonList();