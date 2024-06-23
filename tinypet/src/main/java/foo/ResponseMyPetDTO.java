package foo;

import java.util.List;

public class ResponseMyPetDTO {
    private Long id;
    private String namePetition;
    private String description;
    private List<String> signataires;
    private List<String> tags;
    private long nbsignataires;
    private String pseudo;
    private String formattedDate;
    private String cursor;

    public ResponseMyPetDTO(Long id, String namePetition, String description,List<String> signataires, long nbsignataires, String pseudo, String formattedDate,List<String> tags,String cursor) {
        this.id = id;
        this.namePetition = namePetition;
        this.description = description;
        this.signataires = signataires;
        this.nbsignataires = nbsignataires;
        this.pseudo = pseudo;
        this.formattedDate = formattedDate;
        this.tags = tags;
        this.cursor = cursor;
    }

    public ResponseMyPetDTO(Long id, String namePetition, String description,List<String> signataires, long nbsignataires, String pseudo, String formattedDate,List<String> tags) {
        this.id = id;
        this.namePetition = namePetition;
        this.description = description;
        this.signataires = signataires;
        this.nbsignataires = nbsignataires;
        this.pseudo = pseudo;
        this.formattedDate = formattedDate;
        this.tags = tags;
        this.cursor = cursor;
    }

    // Getters et setters pour chaque champ
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNamePetition() {
        return namePetition;
    }

    public void setNamePetition(String namePetition) {
        this.namePetition = namePetition;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getsignataires() {
        return signataires;
    }

    public void setsignataires(List<String> signataires) {
        this.signataires = signataires;
    }

    public long getnbsignataires() {
        return nbsignataires;
    }

    public void setnbsignataires(long nbsignataires) {
        this.nbsignataires = nbsignataires;
    }

    public String getPseudo() {
        return pseudo;
    }

    public String getCursor() {
        return cursor;
    }

    public void setPseudo(String pseudo) {
        this.pseudo = pseudo;
    }

    public void setCursor(String cursor) {
        this.cursor = cursor;
    }
    public String getFormattedDate() {
        return formattedDate;
    }

    public void setFormattedDate(String formattedDate) {
        this.formattedDate = formattedDate;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
