/**
 * Header module to manage user authentication, search functionality, and navigation.
 */
var sizeDescription = 150;

var Header = {
    searchQuery: "",
    searchTimeout: null,
    searchResults: [],
    expandedDescriptions: new Set(),
    searchInitiated: false,

    /**
     * Setup Google authentication on creation of the header.
     */
    oncreate: () => {
        loadGoogleScript(() => {
            google.accounts.id.initialize({
                client_id: '726535612925-dh7751p200jpjnlfcbbntosqh8fpp361.apps.googleusercontent.com',
                callback: handleCredentialResponse
            });
            google.accounts.id.renderButton(
                document.getElementById("google-signin-button"),
                { theme: 'outline', size: 'large' }
            );
            google.accounts.id.prompt();
        });
    },

    /**
     * Handles real-time search input, debouncing requests to avoid excessive API calls.
     * @param {Event} event - The input event.
     */
    handleSearchInput: (event) => {
        Header.searchQuery = event.target.value;
        clearTimeout(Header.searchTimeout);
        if (Header.searchQuery.trim() === "") {
            Header.clearSearchResults();
            return;
        }
        Header.searchTimeout = setTimeout(() => {
            Header.performSearch(Header.searchQuery);
        }, 1500);
    },

    /**
     * Performs a search query using an API call if the query is not empty.
     * @param {string} query - The search query.
     */
    performSearch: (query) => {
        if (!query.trim()) {
            console.log("Empty query, not performing search.");
            Header.clearSearchResults();
            return;
        }
        Header.searchInitiated = true;
        VisualEffects.showLoadingSpinner();
        VisualEffects.scrollToTopInput();

        m.request({
            method: "GET",
            url: `https://faculte-tp1.ew.r.appspot.com/ressources/api/tinyPet/1/petitionsByTags/${encodeURIComponent(query)}`
        }).then((result) => {
            VisualEffects.hideLoadingSpinner();
            Header.searchResults = result.items || [];
            m.redraw();
            VisualEffects.highlightResults();
            setTimeout(VisualEffects.scrollToBottom, 2000);
        }).catch((error) => {
            VisualEffects.hideLoadingSpinner();
            console.error("Search error:", error);
        });
    },

    /**
     * Clears the search results and resets search-related states.
     */
    clearSearchResults: () => {
        Header.searchResults = [];
        Header.searchQuery = "";
        Header.searchInitiated = false;
        const inputElement = document.querySelector(".input");
        if (inputElement) {
            inputElement.value = "";
        }
        Header.expandedDescriptions.clear();
        m.redraw();
    },

    /**
     * View function to render the header, including the navigation bar and search results.
     */
    view: () => {
        return m("header", { class: "header" }, [
            Header.renderNavbar(),
            Header.renderSearchResults()
        ]);
    },

    /**
     * Renders the navigation bar with user authentication status and search input.
     */
    renderNavbar: () => {
        return m("nav", { class: "navbar" }, [
            m("div", { class: "navbar-brand" }, [
                m("a", { class: "navbar-item", href: "https://faculte-tp1.ew.r.appspot.com" }, "Menu")
            ]),
            m("div", { class: "navbar-menu" }, [
                Header.renderSearchInput(),
                Header.renderUserControls()
            ])
        ]);
    },

    /**
     * Renders the search input component within the navbar.
     */
    renderSearchInput: () => {
        return m("div", { class: "navbar-start" }, [
            m("div", { class: "navbar-item" }, [
                m("input", {
                    class: "input",
                    type: "text",
                    placeholder: "Recherche par tag...",
                    oninput: Header.handleSearchInput,
                    value: Header.searchQuery
                })
            ])
        ]);
    },

    /**
     * Renders user controls depending on authentication status.
     */
    renderUserControls: () => {
        return m("div", { class: "navbar-end" }, [
            User.isAuthenticated ?
            [
                m("div", { class: "navbar-item" }, `Connecté en tant que :  ${User.name}`),
                m("button", { class: "button is-info stylish-button", onclick: () => m.route.set("/createPetition") }, "Créer une pétition"),
                m("button", { class: "button stylish-button", onclick: () => m.route.set("/userPetitions") }, "Mon compte"),
                m("button", { class: "button is-danger stylish-button", onclick: logout }, "Se déconnecter")
            ] :
            m("div", { class: "navbar-item" }, [
                m("div", { id: "google-signin-button" })
            ])
        ]);
    },

    /**
     * Renders search results if any or a message if none found.
     */
    renderSearchResults: () => {
        return (Header.searchResults.length > 0) ? m("section", { class: "section search-results" }, [
            m("table", { class: "table is-striped" }, [
                Header.renderTableHeader(),
                Header.renderTableBody()
            ])
        ]) : (Header.searchInitiated && Header.searchResults.length === 0 ? m("div", { class: "section search-results" }, [
            m("p", "Aucune pétition ne comportant ce tag a été trouvée")
        ]) : null);
    },

    /**
     * Renders the table header for search results.
     */
    renderTableHeader: () => {
        return m("thead", [
            m("tr", [
                m("th", "Pseudo"),
                m("th", "Nom"),
                m("th", "Description"),
                m("th", "Nombre de signature"),
                m("th", "Date de création"),
                m("th", "Tags"),
                m("th", "Signer")
            ])
        ]);
    },

    /**
     * Renders the table body for search results.
     */
    renderTableBody: () => {
        return m("tbody", [
            Header.searchResults.map(petition => m("tr", [
                m("td", petition.pseudo),
                m("td", petition.namePetition),
                m("td", petition.description.length > sizeDescription ? `${petition.description.substring(0, sizeDescription)}...` : petition.description),
                m("td", petition.nbsignataires.toString()),
                m("td", petition.formattedDate),
                m("td", petition.tags.join(', ')),
                m("td", [
                    m("button", {
                        class: "button is-success",
                        onclick: () => Header.signPetition(petition.id)
                    }, "Signer")
                ])
            ]))
        ]);
    }
};

// Initialization code if needed could go here
