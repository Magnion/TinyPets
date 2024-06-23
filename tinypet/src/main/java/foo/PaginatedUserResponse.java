package foo;

import java.util.List;

public class PaginatedUserResponse {
    private List<String> userPseudos;
    private String cursor;

    public PaginatedUserResponse(List<String> userPseudos, String cursor) {
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