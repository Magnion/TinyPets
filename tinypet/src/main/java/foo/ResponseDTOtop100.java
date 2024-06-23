package foo;

import java.util.List;

public class ResponseDTOtop100 {
    private Long id;
    private String namePetition;
    private String description;
    private long nbsignataires;
    private String pseudo;
    private String formattedDate;
    private List<String> tags;

    public ResponseDTOtop100(Long id, String namePetition, String description, long nbsignataires, String pseudo, String formattedDate,List<String> tags) {
        this.id = id;
        this.namePetition = namePetition;
        this.description = description;
        this.nbsignataires = nbsignataires;
        this.pseudo = pseudo;
        this.formattedDate = formattedDate;
        this.tags = tags;
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

    public long getNbsignataires() {
        return nbsignataires;
    }

    public void setNbsignataires(long nbsignataires) {
        this.nbsignataires = nbsignataires;
    }

    public String getPseudo() {
        return pseudo;
    }

    public void setPseudo(String pseudo) {
        this.pseudo = pseudo;
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
