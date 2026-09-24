const API_BASE_URL = "https://pokeapi.co/api/v2";

let pokemonList = [];

let fighter1 = null;
let fighter2 = null;

let battleOver = false;

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

        console.log("Lista de Pokémon cargada:", pokemonList.length);
    } catch (error) {
        console.error(error.message);
    }
}

loadPokemonList();