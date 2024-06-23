/**
 * Table module to manage the display and interaction with a list of top 100 petitions.
 */
var sizeDescription = 150;

var Table = {
    data: [],
    expandedDescriptions: new Set(),

    /**
     * Initializes the module by fetching top 100 petitions from the server.
     */
    oninit: function() {
        m.request({
            method: "GET",
            url: "https://faculte-tp1.ew.r.appspot.com/ressources/api/tinyPet/1/top100Petitions"
        }).then(this.handleFetchResponse)
          .catch(this.handleError);
    },

    /**
     * Handles the successful fetch response by updating the table data.
     * @param {Object} result - The response object containing petition items.
     */
    handleFetchResponse: function(result) {
        if (result && result.items) {
            Table.data = result.items;
        } else {
            console.error("Invalid or empty response format:", result);
            NotificationSystem.createNotification("Error retrieving the top 100 petitions", "error");
        }
    },

    /**
     * Handles errors that occur during the fetch operation.
     * @param {Object} error - Error object describing the failure.
     */
    handleError: function(error) {
        console.error("Error fetching data:", error);
        NotificationSystem.createNotification("Error retrieving petitions: " + error.message, "error");
    },

    /**
     * Toggles the expansion of a petition's description.
     * @param {number} id - The unique identifier of the petition.
     */
    toggleDescription: function(id) {
        if (this.expandedDescriptions.has(id)) {
            this.expandedDescriptions.delete(id);
        } else {
            this.expandedDescriptions.add(id);
        }
        m.redraw();
    },

    /**
     * Initiates the process to sign a petition.
     * @param {number} petitionId - The unique identifier of the petition to sign.
     */
    signPetition: function(petitionId) {
        if (User.token == "") {
            console.error("L'utilisateur n'est pas connecté.");
            NotificationSystem.createNotification("Vous devez être connecté pour signer une pétition", "error");
            return;
        }

        if (isTokenExpired(User.token)) {
            NotificationSystem.createNotification("Votre session a expiré. Veuillez vous reconnecter.", "error");
            logout();
            return;
        }

        const requestData = {
            id: petitionId,
            userId: User.id,
            token: User.token
        };

        fetch("https://faculte-tp1.ew.r.appspot.com/ressources/api/tinyPet/1/signer", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(requestData)
        })
        .then(this.handleSignResponse.bind(this, petitionId))
        .catch(this.handleSignError);
    },

    /**
     * Handles the response after attempting to sign a petition.
     * @param {number} petitionId - The ID of the petition that was signed.
     * @param {Response} response - The fetch response object.
     */
    handleSignResponse: async function(petitionId, response) {
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error && errData.error.message ? errData.error.message : "Une erreur inconnue est survenue, réessayez plus tard");
        }
        const data = await response.json();
        console.log("Pétition signée", data);
        const petition = this.data.find(p => p.id === petitionId);
        if (petition) {
            petition.nbsignataires++;
        }
        m.redraw();
        NotificationSystem.createNotification("Pétition signée avec succès!", "success");
    },

    /**
     * Handles errors that occur during the petition signing process.
     * @param {Error} error - Error object describing the failure.
     */
    handleSignError: function(error) {
        console.error("Erreur lors de la signature de la pétition:", error);
        NotificationSystem.createNotification("Erreur lors de la signature de la pétition: " + error.message, "error");
    },

    /**
     * Renders the main view of the module, displaying a table of petitions.
     */
    view: function() {
        return m("div", [
            m("table", { class: "table table-enhanced" }, [
                this.renderTableHeader(),
                this.renderTableBody()
            ])
        ]);
    },

    /**
     * Renders the header of the table.
     */
    renderTableHeader: function() {
        return m("thead", [
            m("tr", [
                m("th", "Créateur"),
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
     * Renders the body of the table, listing each petition.
     */
    renderTableBody: function() {
        return m("tbody", this.data.map(this.renderTableRow));
    },

    /**
     * Renders a single row in the table body.
     * @param {Object} petition - The petition data to render.
     */
    renderTableRow: function(petition) {
        var isExpanded = Table.expandedDescriptions.has(petition.id);
        var description = isExpanded || petition.description.length <= sizeDescription ? petition.description : petition.description.substring(0, sizeDescription) + "...";
        return m("tr", { "data-id": petition.id }, [
            m("td", petition.pseudo),
            m("td", petition.namePetition),
            m("td", { class: "description" }, [
                m("div", description),
                petition.description.length > sizeDescription ? m("button", {
                    class: "button is-small is-link",
                    onclick: () => Table.toggleDescription(petition.id)
                }, isExpanded ? "Collapse" : "Expand") : null
            ]),
            m("td", petition.nbsignataires.toString()),
            m("td", petition.formattedDate),
            m("td", petition.tags.join(', ')),
            m("td", [
                m("button", {
                    class: "button is-success",
                    onclick: () => Table.signPetition(petition.id)
                }, "Signer")
            ])
        ]);
    }
};

