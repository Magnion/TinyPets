package foo;

import java.util.List;

public class PaginatedResponse {
    private List<ResponseMyPetDTO> items;
    private String cursor;

    public PaginatedResponse(List<ResponseMyPetDTO> items, String cursor) {
        this.items = items;
        this.cursor = cursor;
    }

    public List<ResponseMyPetDTO> getItems() {
        return items;
    }

    public String getCursor() {
        return cursor;
    }
}
