package foo;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.appengine.api.datastore.*;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.SortDirection;

import javax.inject.Named;
import com.google.api.server.spi.config.Nullable;
import com.google.api.server.spi.response.ConflictException;
import com.google.api.server.spi.response.NotFoundException;
import com.google.api.server.spi.response.UnauthorizedException;

@Api(
    name = "tinyPet",
    version = "1",
    audiences = "927375242383-t21v9ml38tkh2pr30m4hqiflkl3jfohl.apps.googleusercontent.com",
    clientIds = {
        "927375242383-t21v9ml38tkh2pr30m4hqiflkl3jfohl.apps.googleusercontent.com",
        "927375242383-jm45ei76rdsfv7tmjv58tcsjjpvgkdje.apps.googleusercontent.com"
    }
)
public class PetitionEndpoint {

    private static final int DEFAULT_LIMIT = 500;
    private static final int DEFAULT_LIMIT_USER = 3;
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("dd-MM-yyyy HH:mm");

    @ApiMethod(name = "petitionCreatedUser", path = "petitionCreatedUser/{userId}", httpMethod = HttpMethod.GET)
    public PaginatedResponse getPetitionCreatedByUser(@Named("userId") String userId, @Named("curs") @Nullable String cursor) throws NotFoundException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        Entity userEntity = getUserByEmail(userId, datastore);
        List<String> createdPetitionIds = getCreatedPetitionIds(userEntity);

        List<Key> petitionKeys = createdPetitionIds.stream().map(KeyFactory::stringToKey).collect(Collectors.toList());
        Query petitionQuery = new Query("Petition")
            .setFilter(new Query.FilterPredicate("__key__", Query.FilterOperator.IN, petitionKeys))
            .addSort("creationDate", Query.SortDirection.DESCENDING);

        FetchOptions fetchOptions = FetchOptions.Builder.withLimit(DEFAULT_LIMIT);
        if (cursor != null && !cursor.isEmpty()) {
            fetchOptions.startCursor(Cursor.fromWebSafeString(cursor));
        }

        PreparedQuery pq = datastore.prepare(petitionQuery);
        QueryResultList<Entity> petitionEntities = pq.asQueryResultList(fetchOptions);

        List<ResponseMyPetDTO> response = petitionEntities.stream()
            .map(petitionEntity -> {
                try {
                    return createResponseMyPetDTO(petitionEntity, datastore);
                } catch (NotFoundException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                return null;
            })
            .collect(Collectors.toList());

        String endCursor = petitionEntities.getCursor() != null ? petitionEntities.getCursor().toWebSafeString() : null;
        return new PaginatedResponse(response, endCursor);
    }

    private Entity getUserByEmail(String email, DatastoreService datastore) throws NotFoundException {
        Query.Filter emailFilter = new Query.FilterPredicate("mail", Query.FilterOperator.EQUAL, email);
        Query userQuery = new Query("Client").setFilter(emailFilter);
        PreparedQuery userPq = datastore.prepare(userQuery);
        Entity userEntity = userPq.asSingleEntity();

        if (userEntity == null) {
            throw new NotFoundException("Votre email n'a pas été trouvé, vous n'avez pas de compte pour : " + email);
        }
        return userEntity;
    }

    private List<String> getCreatedPetitionIds(Entity userEntity) throws NotFoundException {
        List<String> createdPetitionIds = (List<String>) userEntity.getProperty("petitions");
        if (createdPetitionIds == null || createdPetitionIds.isEmpty()) {
            throw new NotFoundException("Pas de pétition créée trouvée pour l'utilisateur.");
        }
        return createdPetitionIds;
    }

    private ResponseMyPetDTO createResponseMyPetDTO(Entity petitionEntity, DatastoreService datastore) throws NotFoundException {
        String namePetition = (String) petitionEntity.getProperty("nom");
        String description = ((Text) petitionEntity.getProperty("description")).getValue();
        Date creationDate = (Date) petitionEntity.getProperty("creationDate");
        String email = (String) petitionEntity.getProperty("mailCreateur");
        long nbsignataires = (long) petitionEntity.getProperty("nbSignatures");
        List<String> tags = (List<String>) petitionEntity.getProperty("tags");
        Long id = petitionEntity.getKey().getId();

        PaginatedUserResponse signataires = getUserPseudosByPetitionId(id, datastore, null, DEFAULT_LIMIT_USER);
        String pseudo = getPseudoByEmail(email, datastore);
        String formattedDate = DATE_FORMAT.format(creationDate);

        return new ResponseMyPetDTO(id, namePetition, description, signataires.getUserPseudos(), nbsignataires, pseudo, formattedDate, tags, signataires.getCursor());
    }

    private String getPseudoByEmail(String email, DatastoreService datastore) throws NotFoundException {
        Entity userEntity = getUserByEmail(email, datastore);
        return (String) userEntity.getProperty("pseudo");
    }

    private PaginatedUserResponse getUserPseudosByPetitionId(Long petitionId, DatastoreService datastore, String startCursor, int limit) {
        String petitionKeyString = KeyFactory.keyToString(KeyFactory.createKey("Petition", petitionId));

        Query.Filter petitionFilter = new Query.FilterPredicate("petitionsSigne", Query.FilterOperator.EQUAL, petitionKeyString);
        Query q = new Query("Client").setFilter(petitionFilter);

        FetchOptions fetchOptions = FetchOptions.Builder.withLimit(limit);
        if (startCursor != null && !startCursor.isEmpty()) {
            fetchOptions.startCursor(Cursor.fromWebSafeString(startCursor));
        }

        PreparedQuery pq = datastore.prepare(q);
        QueryResultList<Entity> results = pq.asQueryResultList(fetchOptions);

        List<String> userPseudos = results.stream()
            .map(userEntity -> (String) userEntity.getProperty("pseudo"))
            .collect(Collectors.toList());

        String endCursor = results.getCursor() != null ? results.getCursor().toWebSafeString() : null;
        return new PaginatedUserResponse(userPseudos, endCursor);
    }

    @ApiMethod(name = "petitionSignedUser", path = "petitionSignedUser/{userId}", httpMethod = HttpMethod.GET)
    public List<ResponseSignedPetDTO> getPetitionSignedByUser(@Named("userId") String userId) throws NotFoundException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

        Entity userEntity = getUserByEmail(userId, datastore);
        List<String> signedPetitionIds = (List<String>) userEntity.getProperty("petitionsSigne");
        if (signedPetitionIds == null || signedPetitionIds.isEmpty()) {
            throw new NotFoundException("Pas de pétition trouvée pour l'utilisateur avec le mail : " + userId);
        }

        List<Key> petitionKeys = signedPetitionIds.stream().map(KeyFactory::stringToKey).collect(Collectors.toList());
        Query petitionQuery = new Query("Petition")
            .setFilter(new Query.FilterPredicate("__key__", Query.FilterOperator.IN, petitionKeys))
            .addSort("creationDate", Query.SortDirection.DESCENDING);

        PreparedQuery pq = datastore.prepare(petitionQuery);
        List<Entity> petitionEntities = pq.asList(FetchOptions.Builder.withLimit(100));

        return petitionEntities.stream()
            .map(petitionEntity -> {
                try {
                    return createResponseSignedPetDTO(petitionEntity, datastore);
                } catch (NotFoundException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                return null;
            })
            .collect(Collectors.toList());
    }

    private ResponseSignedPetDTO createResponseSignedPetDTO(Entity petitionEntity, DatastoreService datastore) throws NotFoundException {
        String namePetition = (String) petitionEntity.getProperty("nom");
        String description = ((Text) petitionEntity.getProperty("description")).getValue();
        Date creationDate = (Date) petitionEntity.getProperty("creationDate");
        String email = (String) petitionEntity.getProperty("mailCreateur");
        long nbsignataires = (long) petitionEntity.getProperty("nbSignatures");
        List<String> tags = (List<String>) petitionEntity.getProperty("tags");
        Long id = petitionEntity.getKey().getId();

        String pseudo = getPseudoByEmail(email, datastore);
        String formattedDate = DATE_FORMAT.format(creationDate);

        return new ResponseSignedPetDTO(id, namePetition, description, nbsignataires, pseudo, formattedDate, tags);
    }

    @ApiMethod(name = "getPetition", path = "petition/{id}", httpMethod = HttpMethod.GET)
    private Entity getPetitionById(@Named("id") Long id) throws NotFoundException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Key petitionKey = KeyFactory.createKey("Petition", id);

        Query.Filter keyFilter = new Query.FilterPredicate(Entity.KEY_RESERVED_PROPERTY, Query.FilterOperator.EQUAL, petitionKey);
        Query query = new Query("Petition").setFilter(keyFilter);
        PreparedQuery preparedQuery = datastore.prepare(query);

        Entity petitionEntity = preparedQuery.asSingleEntity();
        if (petitionEntity == null) {
            throw new NotFoundException("Votre pétition n'a pas été trouvée selon l'id : " + id);
        }
        return petitionEntity;
    }

    @ApiMethod(name = "getSignatureUsers", path = "usersSigned/{id}", httpMethod = HttpMethod.GET)
    public PaginatedUserResponse getSignatureUsers(@Named("id") Long id, @Named("cursor") @Nullable String cursor) throws NotFoundException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        return getUserPseudosByPetitionId(id, datastore, cursor, DEFAULT_LIMIT);
    }

    @ApiMethod(name = "getTop100Petitions", path = "top100Petitions", httpMethod = HttpMethod.GET)
    public List<ResponseDTOtop100> getTopPetitions() throws NotFoundException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Query query = new Query("Petition").addSort("creationDate", Query.SortDirection.DESCENDING);

        PreparedQuery preparedQuery = datastore.prepare(query);
        List<Entity> topPetitions = preparedQuery.asList(FetchOptions.Builder.withLimit(100));

        return topPetitions.stream()
            .map(petitionEntity -> {
                try {
                    return createResponseDTOtop100(petitionEntity, datastore);
                } catch (NotFoundException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                return null;
            })
            .collect(Collectors.toList());
    }

    private ResponseDTOtop100 createResponseDTOtop100(Entity petitionEntity, DatastoreService datastore) throws NotFoundException {
        String namePetition = (String) petitionEntity.getProperty("nom");
        String description = ((Text) petitionEntity.getProperty("description")).getValue();
        Date creationDate = (Date) petitionEntity.getProperty("creationDate");
        String email = (String) petitionEntity.getProperty("mailCreateur");
        long nbsignataires = (long) petitionEntity.getProperty("nbSignatures");
        List<String> tags = (List<String>) petitionEntity.getProperty("tags");
        Long id = petitionEntity.getKey().getId();

        String pseudo = getPseudoByEmail(email, datastore);
        String formattedDate = DATE_FORMAT.format(creationDate);

        return new ResponseDTOtop100(id, namePetition, description, nbsignataires, pseudo, formattedDate, tags);
    }

    @ApiMethod(name = "signerPetition", path = "signer", httpMethod = HttpMethod.POST)
    public Entity signerPetition(PostSignerPetitionDto pm) throws NotFoundException, UnauthorizedException {
        List<Object> result = GoogleAuthVerifier.verifyToken(pm.token, pm.userId);
        boolean isVerified = (Boolean) result.get(0);
        String email = (String) result.get(1);

        if (!isVerified) {
            throw new UnauthorizedException("Votre Id ou votre token est invalide ou expiré.");
        }

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Entity petitionEntity = getPetitionById(pm.id);

        if (email.equals(petitionEntity.getProperty("mailCreateur"))) {
            throw new UnauthorizedException("Vous ne pouvez pas signer votre propre pétition, votre email : " + email);
        }

        Entity userEntity = getUserByEmail(email, datastore);
        String petitionKeyString = KeyFactory.keyToString(petitionEntity.getKey());
        List<String> petitionIds = (List<String>) userEntity.getProperty("petitionsSigne");

        if (petitionIds == null) {
            petitionIds = new ArrayList<>();
        }

        if (petitionIds.contains(petitionKeyString)) {
            throw new UnauthorizedException("Vous ne pouvez pas signer une pétition deux fois, votre email : " + email);
        }

        boolean success = false;
        while (!success) {
            Transaction txn = datastore.beginTransaction();
            try {
                petitionEntity = datastore.get(txn, petitionEntity.getKey());
                long nb_signatures = (Long) petitionEntity.getProperty("nbSignatures");
                petitionEntity.setProperty("nbSignatures", nb_signatures + 1);
                datastore.put(txn, petitionEntity);

                petitionIds.add(petitionKeyString);
                userEntity.setProperty("petitionsSigne", petitionIds);
                datastore.put(txn, userEntity);

                txn.commit();
                success = true;
            } catch (ConcurrentModificationException e) {
                if (txn.isActive()) {
                    txn.rollback();
                }
            } catch (EntityNotFoundException e) {
                throw new NotFoundException("Pétition non trouvée.");
            } finally {
                if (txn.isActive()) {
                    txn.rollback();
                }
            }
        }

        return petitionEntity;
    }

    @ApiMethod(name = "getPetitionsByTags", path = "petitionsByTags/{tags}", httpMethod = HttpMethod.GET)
    public List<ResponseDTOtop100> getPetitionsByTags(@Named("tags") String tags) throws NotFoundException {
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        List<Filter> tagFilters = Arrays.stream(tags.split(","))
            .map(tag -> new FilterPredicate("tags", Query.FilterOperator.EQUAL, tag))
            .collect(Collectors.toList());

        Query query = new Query("Petition");
        if (tagFilters.size() > 1) {
            Filter compositeFilter = tagFilters.stream()
                .reduce(Query.CompositeFilterOperator::or)
                .orElse(null);
            query.setFilter(compositeFilter);
        } else if (!tagFilters.isEmpty()) {
            query.setFilter(tagFilters.get(0));
        } else {
            return Collections.emptyList();
        }

        query.addSort("creationDate", SortDirection.DESCENDING);
        PreparedQuery preparedQuery = datastore.prepare(query);
        List<Entity> petitionsByTags = preparedQuery.asList(FetchOptions.Builder.withLimit(100));

        return petitionsByTags.stream()
            .map(petitionEntity -> {
                try {
                    return createResponseDTOtop100(petitionEntity, datastore);
                } catch (NotFoundException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                return null;
            })
            .collect(Collectors.toList());
    }

    @ApiMethod(name = "addUser", path = "addUser", httpMethod = HttpMethod.POST)
    public Entity addUser(CreateUserDTO pm) throws UnauthorizedException, ConflictException {
        List<Object> result = GoogleAuthVerifier.verifyToken(pm.token, pm.userId);
        boolean isVerified = (Boolean) result.get(0);
        String email = (String) result.get(1);
        String pseudo = (String) result.get(2);

        if (!isVerified) {
            throw new UnauthorizedException("Votre Id ou votre token est invalide ou expiré.");
        }

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Transaction txn = datastore.beginTransaction();

        try {
            Entity userEntity = getUserByEmail(email, datastore);
            throw new ConflictException("Utilisateur déjà créé : " + email);
        } catch (NotFoundException e) {
            try {
                Entity userEntity = new Entity("Client");
                userEntity.setProperty("mail", email);
                userEntity.setProperty("pseudo", (pm.pseudo == null || pm.pseudo.isEmpty()) ? pseudo : pm.pseudo);
                datastore.put(txn, userEntity);
                txn.commit();
                return userEntity;
            } finally {
                if (txn.isActive()) {
                    txn.rollback();
                }
            }
        }
    }

    @ApiMethod(name = "createPetition", httpMethod = HttpMethod.POST)
    public Entity createPetition(PostPetitionDTO pm) throws UnauthorizedException {
        List<Object> result = GoogleAuthVerifier.verifyToken(pm.token, pm.userId);
        boolean isVerified = (Boolean) result.get(0);
        String email = (String) result.get(1);
        String name = (String) result.get(2);

        if (!isVerified) {
            throw new UnauthorizedException("Votre Id ou votre token est invalide ou expiré.");
        }

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        Transaction txn = datastore.beginTransaction();

        Set<String> tags = new HashSet<>(Arrays.asList(pm.tags.split(",")));

        Entity petitionEntity = new Entity("Petition");
        petitionEntity.setProperty("nom", pm.name);
        petitionEntity.setProperty("description", new Text(pm.description));
        petitionEntity.setProperty("tags", tags);
        petitionEntity.setProperty("mailCreateur", email);
        petitionEntity.setProperty("creationDate", new Date());
        petitionEntity.setProperty("nbSignatures", 0);

        try {
            datastore.put(txn, petitionEntity);
            String petitionKey = KeyFactory.keyToString(petitionEntity.getKey());

            Entity userEntity;
            try {
                userEntity = getUserByEmail(email, datastore);
                List<String> existingPetitions = (List<String>) userEntity.getProperty("petitions");
                if (existingPetitions == null) {
                    existingPetitions = new ArrayList<>();
                }
                existingPetitions.add(petitionKey);
                userEntity.setProperty("petitions", existingPetitions);
            } catch (NotFoundException e) {
                userEntity = new Entity("Client");
                userEntity.setProperty("mail", email);
                userEntity.setProperty("petitions", new ArrayList<>(Collections.singletonList(petitionKey)));
                userEntity.setProperty("pseudo", name);
            }

            datastore.put(txn, userEntity);
            txn.commit();
        } finally {
            if (txn.isActive()) {
                txn.rollback();
            }
        }

        return petitionEntity;
    }
}
