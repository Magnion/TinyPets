// Configuration du routage
m.route(document.getElementById("app"), "/", {
    "/": Home,
    "/createPetition": CreatePetition,
    "/signedPetitions": PetitionTabs,
    "/createdPetitions": PetitionTabs,
    "/userPetitions": PetitionTabs
});
