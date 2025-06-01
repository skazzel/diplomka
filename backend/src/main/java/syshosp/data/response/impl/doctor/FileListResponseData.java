package syshosp.data.response.impl.doctor;

import syshosp.data.response.AbstractResponseData;

import java.util.List;

public class FileListResponseData extends AbstractResponseData
{
    private final List<FileResponseData> fileListData;

    public FileListResponseData(List<FileResponseData> fileListData){
        super(200);

        this.fileListData = fileListData;
    }

    public List<FileResponseData> getFileListData() {
        return this.fileListData;
    }
}