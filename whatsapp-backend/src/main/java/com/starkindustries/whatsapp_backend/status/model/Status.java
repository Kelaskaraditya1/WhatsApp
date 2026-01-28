package com.starkindustries.whatsapp_backend.status.model;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.starkindustries.whatsapp_backend.status.enums.StatusType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class Status {

    @Id
    private String id;
    private String mediaUrl;
    private String caption;
    private StatusType statusType;
    private String userId;
    private Long createdAt;
    private int views;
    private List<Viewer> viewers;

    public boolean isStatusFresh(){

        if((System.currentTimeMillis()-createdAt)>(1000L*60*60*24))
            return false;
        return true;

    }

    public void incrementView(){
        views++;
    }

    public boolean addViewer(Viewer viewer){

        for(Viewer viewer1:viewers){
            if(viewer1.getUserId().equals(viewer.getUserId()))
                return false;
        }

        this.viewers.add(viewer);
        return true;

    }
    
}
