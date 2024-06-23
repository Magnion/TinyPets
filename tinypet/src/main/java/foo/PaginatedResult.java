package foo;

import java.util.List;

// Classe pour encapsuler les résultats paginés
 public class PaginatedResult {
    private List<String> userPseudos;
    private String cursor;

    public PaginatedResult(List<String> userPseudos, String cursor) {
        this.userPseudos = userPseudos;
        this.cursor = cursor;
    }

    public List<String> getUserPseudos() {
        return userPseudos;
    }

    public String getCursor() {
        return cursor;
    }
}